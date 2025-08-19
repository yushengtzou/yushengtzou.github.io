import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { marked } from 'marked'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yushengtzou.github.io'] 
    : ['http://localhost:3000'],
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use(limiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// File upload configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads')
    try {
      await fs.mkdir(uploadDir, { recursive: true })
      cb(null, uploadDir)
    } catch (error) {
      cb(error)
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|md|txt/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Only images and markdown files are allowed'))
    }
  }
})

// Blog posts storage (in production, use a database)
let blogPosts = [
  {
    id: 1,
    title: '難與不難',
    slug: 'difficulty-and-ease',
    excerpt: 'Reflections on the nature of difficulty and challenge in research and life.',
    content: 'Full content of the blog post...',
    date: '2024-11-02T12:00:00Z',
    category: 'Philosophy',
    readTime: '3 min read',
    published: true,
    author: 'Yu-Sheng Tzou'
  },
  {
    id: 2,
    title: '選擇公司的指標',
    slug: 'company-selection-criteria',
    excerpt: 'Key indicators and considerations when choosing a company to work for.',
    content: 'Full content of the blog post...',
    date: '2024-11-02T08:00:00Z',
    category: 'Career',
    readTime: '5 min read',
    published: true,
    author: 'Yu-Sheng Tzou'
  },
  {
    id: 3,
    title: 'The Essence of the "Activity" of Programming',
    slug: 'essence-of-programming-activity',
    excerpt: 'Exploring the fundamental nature of programming as an intellectual activity.',
    content: 'Full content of the blog post...',
    date: '2024-10-06T12:00:00Z',
    category: 'Programming',
    readTime: '7 min read',
    published: true,
    author: 'Yu-Sheng Tzou'
  }
]

// API Routes

// Get all published blog posts
app.get('/api/posts', (req, res) => {
  try {
    const { category, limit } = req.query
    let posts = blogPosts.filter(post => post.published)
    
    if (category && category !== 'All') {
      posts = posts.filter(post => post.category === category)
    }
    
    if (limit) {
      posts = posts.slice(0, parseInt(limit))
    }
    
    posts.sort((a, b) => new Date(b.date) - new Date(a.date))
    res.json(posts)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog posts' })
  }
})

// Get a single blog post by slug
app.get('/api/posts/:slug', (req, res) => {
  try {
    const post = blogPosts.find(p => p.slug === req.params.slug && p.published)
    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' })
    }
    res.json(post)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog post' })
  }
})

// Get all categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = [...new Set(blogPosts.map(post => post.category))]
    res.json(categories)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// Create a new blog post (requires authentication in production)
app.post('/api/posts', upload.single('image'), async (req, res) => {
  try {
    const { title, content, excerpt, category } = req.body
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' })
    }
    
    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()
    
    // Calculate read time (rough estimate: 200 words per minute)
    const wordCount = content.split(/\s+/).length
    const readTime = Math.ceil(wordCount / 200) + ' min read'
    
    const newPost = {
      id: Date.now(),
      title,
      slug,
      excerpt: excerpt || content.substring(0, 150) + '...',
      content,
      date: new Date().toISOString(),
      category: category || 'General',
      readTime,
      published: true,
      author: 'Yu-Sheng Tzou',
      image: req.file ? `/uploads/${req.file.filename}` : null
    }
    
    blogPosts.unshift(newPost)
    
    // In production, save to database
    await saveBlogPosts()
    
    res.status(201).json(newPost)
  } catch (error) {
    console.error('Error creating blog post:', error)
    res.status(500).json({ error: 'Failed to create blog post' })
  }
})

// Update a blog post
app.put('/api/posts/:id', upload.single('image'), async (req, res) => {
  try {
    const postId = parseInt(req.params.id)
    const postIndex = blogPosts.findIndex(p => p.id === postId)
    
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Blog post not found' })
    }
    
    const { title, content, excerpt, category, published } = req.body
    const post = blogPosts[postIndex]
    
    // Update fields
    if (title) {
      post.title = title
      post.slug = title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()
    }
    if (content) {
      post.content = content
      const wordCount = content.split(/\s+/).length
      post.readTime = Math.ceil(wordCount / 200) + ' min read'
    }
    if (excerpt) post.excerpt = excerpt
    if (category) post.category = category
    if (published !== undefined) post.published = published === 'true'
    if (req.file) post.image = `/uploads/${req.file.filename}`
    
    await saveBlogPosts()
    
    res.json(post)
  } catch (error) {
    console.error('Error updating blog post:', error)
    res.status(500).json({ error: 'Failed to update blog post' })
  }
})

// Delete a blog post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id)
    const postIndex = blogPosts.findIndex(p => p.id === postId)
    
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Blog post not found' })
    }
    
    blogPosts.splice(postIndex, 1)
    await saveBlogPosts()
    
    res.json({ message: 'Blog post deleted successfully' })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    res.status(500).json({ error: 'Failed to delete blog post' })
  }
})

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Save blog posts to file (in production, use a database)
async function saveBlogPosts() {
  try {
    const dataDir = path.join(__dirname, '../data')
    await fs.mkdir(dataDir, { recursive: true })
    await fs.writeFile(
      path.join(dataDir, 'blogPosts.json'),
      JSON.stringify(blogPosts, null, 2)
    )
  } catch (error) {
    console.error('Error saving blog posts:', error)
  }
}

// Load blog posts from file
async function loadBlogPosts() {
  try {
    const dataFile = path.join(__dirname, '../data/blogPosts.json')
    const data = await fs.readFile(dataFile, 'utf8')
    blogPosts = JSON.parse(data)
  } catch (error) {
    console.log('No existing blog posts file found, using default posts')
  }
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error)
  res.status(500).json({ error: 'Internal server error' })
})

// Start server
async function startServer() {
  await loadBlogPosts()
  app.listen(PORT, () => {
    console.log(`🚀 Blog management server running on port ${PORT}`)
    console.log(`📝 API endpoints available at http://localhost:${PORT}/api`)
  })
}

startServer().catch(console.error) 