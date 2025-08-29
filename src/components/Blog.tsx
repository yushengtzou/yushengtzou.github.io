import { useState, useEffect } from 'react'
import postsMetadata from '../content/posts.json'

interface BlogPostType {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  date: string
  category: string
  readTime: string
  published: boolean
  author: string
  filename?: string
  image?: string
}

interface BlogProps {
  onViewPost?: (post: BlogPostType) => void
}

const Blog = ({ onViewPost }: BlogProps) => {
  const [blogPosts, setBlogPosts] = useState<BlogPostType[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isLoading, setIsLoading] = useState(true)

  // Fallback static data (same as before)

  const categories = ['All', 'Signal Processing', 'Computer Vision', 'Operating Systems', 'Research', 'AI/ML']

  useEffect(() => {
    fetchBlogPosts()
    
    // Listen for blog post updates from AdminPanel
    const handleBlogUpdate = () => {
      fetchBlogPosts()
    }
    
    window.addEventListener('blogPostUpdated', handleBlogUpdate)
    return () => window.removeEventListener('blogPostUpdated', handleBlogUpdate)
  }, [])

  // Fix animation visibility for dynamically loaded content
  useEffect(() => {
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      const animatedElements = document.querySelectorAll('.animate-on-scroll:not(.visible)')
      animatedElements.forEach((el) => {
        el.classList.add('visible')
      })
    }, 100)
    
    return () => clearTimeout(timer)
  }, [blogPosts, selectedCategory])

  const fetchBlogPosts = async () => {
    try {
      // Use local posts metadata
      const data = postsMetadata as BlogPostType[]
      setBlogPosts(data)
      console.log('✅ Successfully loaded blog posts from local metadata:', data.length)
    } catch (error) {
      console.log('⚠️ Failed to load from local metadata:', error)
      setBlogPosts([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPosts = selectedCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString()
  }

  const handlePostClick = async (post: BlogPostType) => {
    if (onViewPost && post.filename) {
      try {
        // Load the markdown content dynamically from public directory
        const response = await fetch(`/content/posts/${post.filename}`)
        if (response.ok) {
          const content = await response.text()
          // Remove frontmatter (content between --- lines)
          const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\s*/, '')
          const postWithContent = { ...post, content: contentWithoutFrontmatter }
          onViewPost(postWithContent)
        } else {
          console.error('Failed to load post content')
          onViewPost(post) // Show without content
        }
      } catch (error) {
        console.error('Error loading post content:', error)
        onViewPost(post) // Show without content
      }
    } else if (onViewPost) {
      onViewPost(post)
    }
  }

  if (isLoading) {
    return (
      <section id="blog" className="section-padding bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading blog posts...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="blog" className="section-padding bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="animate-on-scroll text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Technical <span className="gradient-text">Blog</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Sharing insights on research and learning.
          </p>
        </div>

        {/* Category Filter */}
        <div className="animate-on-scroll mb-12">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-600 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredPosts.map((post) => (
            <article key={post.id} className="animate-on-scroll group">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden card-hover h-full">
                {/* Featured Image */}
                {post.image && (
                  <div className="h-48 bg-gradient-to-br from-primary-100 to-blue-100 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                {/* Post Header */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                      {post.category}
                    </span>
                    <span className="text-gray-500 text-sm">{post.readTime}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                </div>

                {/* Post Footer */}
                <div className="p-6 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-2">📅</span>
                      {formatDate(post.date)}
                    </div>
                    
                    <button
                      onClick={() => handlePostClick(post)}
                      className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors group"
                    >
                      Read More
                      <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600">No blog posts in the "{selectedCategory}" category yet.</p>
          </div>
        )}

        {/* View All Posts */}
        {/* <div className="animate-on-scroll text-center">
          <a
            href="category/3.blog/"
            className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            View All Posts
            <span className="ml-3">🔗</span>
          </a>
        </div> */}
        <br />
        <br />
        <br />
      </div>
    </section>
  )
}

export default Blog 