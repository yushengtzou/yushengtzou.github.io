import { useState, useEffect } from 'react'

interface BlogPost {
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
  image?: string
}

const AdminPanel = () => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'General'
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const categories = ['General', 'Philosophy', 'Programming', 'Career', 'Life', 'Problem Solving', 'Research', 'AI/ML']

  useEffect(() => {
    checkServerStatus()
    if (isOpen) {
      fetchPosts()
    }
  }, [isOpen])

  const checkServerStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/health')
      if (response.ok) {
        setServerStatus('online')
        setError(null)
      } else {
        setServerStatus('offline')
      }
    } catch (error) {
      setServerStatus('offline')
      setError('Backend server is not running. Please start the server with: npm run server')
    }
  }

  const fetchPosts = async () => {
    if (serverStatus !== 'online') return
    
    try {
      const response = await fetch('http://localhost:3001/api/posts')
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      setError('Failed to fetch posts from server')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (serverStatus !== 'online') {
      alert('Backend server is not running!')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('title', newPost.title)
      formData.append('content', newPost.content)
      formData.append('excerpt', newPost.excerpt)
      formData.append('category', newPost.category)
      
      if (selectedFile) {
        formData.append('image', selectedFile)
      }

      const response = await fetch('http://localhost:3001/api/posts', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const createdPost = await response.json()
        setPosts([createdPost, ...posts])
        setNewPost({ title: '', content: '', excerpt: '', category: 'General' })
        setSelectedFile(null)
        setIsOpen(false)
        alert('Blog post created successfully! 🎉')
        // Trigger a custom event to refresh the Blog component
        window.dispatchEvent(new CustomEvent('blogPostUpdated'))
      } else {
        const error = await response.json()
        setError(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating post:', error)
      setError('Failed to create blog post')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (postId: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const response = await fetch(`http://localhost:3001/api/posts/${postId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId))
        alert('Blog post deleted successfully!')
        window.dispatchEvent(new CustomEvent('blogPostUpdated'))
      } else {
        setError('Failed to delete blog post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      setError('Failed to delete blog post')
    }
  }

  const togglePublished = async (post: BlogPost) => {
    try {
      const formData = new FormData()
      formData.append('published', (!post.published).toString())

      const response = await fetch(`http://localhost:3001/api/posts/${post.id}`, {
        method: 'PUT',
        body: formData
      })

      if (response.ok) {
        const updatedPost = await response.json()
        setPosts(posts.map(p => p.id === post.id ? updatedPost : p))
        window.dispatchEvent(new CustomEvent('blogPostUpdated'))
      }
    } catch (error) {
      console.error('Error updating post:', error)
      setError('Failed to update post')
    }
  }

  return (
    <>
      {/* Admin Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 z-50 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
          serverStatus === 'online' 
            ? 'bg-primary-600 hover:bg-primary-700' 
            : 'bg-red-600 hover:bg-red-700'
        }`}
        title={serverStatus === 'online' ? 'Admin Panel' : 'Admin Panel (Server Offline)'}
      >
        <span className="text-xl">⚙️</span>
      </button>

      {/* Admin Panel Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Blog Admin Panel</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-3 h-3 rounded-full ${
                      serverStatus === 'online' ? 'bg-green-500' : 
                      serverStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <span className="text-sm text-gray-600">
                      Server: {serverStatus === 'online' ? 'Online' : serverStatus === 'offline' ? 'Offline' : 'Checking...'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-red-500 mr-2">❌</span>
                    <p className="text-red-700">{error}</p>
                  </div>
                  {serverStatus === 'offline' && (
                    <div className="mt-2">
                      <button
                        onClick={checkServerStatus}
                        className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Retry Connection
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Create New Post Form */}
              {serverStatus === 'online' && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Create New Blog Post</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={newPost.title}
                        onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          value={newPost.category}
                          onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Featured Image
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Excerpt
                      </label>
                      <textarea
                        value={newPost.excerpt}
                        onChange={(e) => setNewPost({...newPost, excerpt: e.target.value})}
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Brief description of the post..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content (Markdown supported)
                      </label>
                      <textarea
                        value={newPost.content}
                        onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                        rows={8}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Write your blog post content here..."
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Creating...' : 'Create Blog Post'}
                    </button>
                  </form>
                </div>
              )}

              {/* Existing Posts */}
              {serverStatus === 'online' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Manage Existing Posts</h3>
                  {posts.length === 0 ? (
                    <p className="text-gray-500">No blog posts found.</p>
                  ) : (
                    <div className="space-y-4">
                      {posts.map(post => (
                        <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{post.title}</h4>
                              <p className="text-sm text-gray-500 mb-2">
                                {post.category} • {new Date(post.date).toLocaleDateString()}
                              </p>
                              <p className="text-gray-600 text-sm">{post.excerpt}</p>
                            </div>
                            <div className="flex items-center space-x-3 ml-4">
                              <button
                                onClick={() => togglePublished(post)}
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  post.published 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {post.published ? 'Published' : 'Draft'}
                              </button>
                              <button
                                onClick={() => handleDelete(post.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Offline Message */}
              {serverStatus === 'offline' && (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🔌</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Server Offline</h3>
                  <p className="text-gray-600 mb-4">
                    The blog management server is not running. Please start it in a new terminal:
                  </p>
                  <code className="bg-gray-100 px-4 py-2 rounded-lg">npm run server</code>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminPanel 