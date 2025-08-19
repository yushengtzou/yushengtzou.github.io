import { useState, useEffect } from 'react'
import { HiLogout, HiUser } from 'react-icons/hi'
import AdminLogin from './AdminLogin'

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
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<string>('')

  // Existing state
  const [isOpen, setIsOpen] = useState(false)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'General',
    author: 'Yu-Sheng Tzou'
  })

  // Check authentication status on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('adminAuth')
    const authUser = localStorage.getItem('adminUser')
    if (authStatus === 'true' && authUser) {
      setIsAuthenticated(true)
      setCurrentUser(authUser)
    }
  }, [])

  // Hidden keyboard shortcut for admin access
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl + Shift + A to open admin login
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault()
        if (!isAuthenticated) {
          // Show login form directly
          setIsOpen(true)
        } else {
          // If already authenticated, toggle admin panel
          setIsOpen(!isOpen)
        }
      }
      // ESC to close admin panel
      if (e.key === 'Escape' && (isOpen || !isAuthenticated)) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isAuthenticated, isOpen])

  // Check server status
  useEffect(() => {
    if (isAuthenticated) {
      checkServerStatus()
    }
  }, [isAuthenticated])

  // Fetch posts when authenticated and server is online
  useEffect(() => {
    if (isAuthenticated && serverStatus === 'online') {
      fetchPosts()
    }
  }, [isAuthenticated, serverStatus])

  const handleLogin = async (username: string, password: string) => {
    setLoginLoading(true)
    setLoginError(null)

    try {
      // Simulate authentication (replace with real API call)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Demo credentials
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('adminAuth', 'true')
        localStorage.setItem('adminUser', username)
        setIsAuthenticated(true)
        setCurrentUser(username)
        setLoginError(null)
      } else {
        setLoginError('Invalid username or password')
      }
    } catch (err) {
      setLoginError('Login failed. Please try again.')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    localStorage.removeItem('adminUser')
    setIsAuthenticated(false)
    setCurrentUser('')
    setIsOpen(false)
    setPosts([])
  }

  const checkServerStatus = async () => {
    try {
      const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'
      const response = await fetch(`${baseUrl}/api/health`)
      if (response.ok) {
        setServerStatus('online')
        setError(null)
      } else {
        setServerStatus('offline')
      }
    } catch (err) {
      setServerStatus('offline')
      setError('Cannot connect to server. Please ensure the backend is running.')
    }
  }

  const fetchPosts = async () => {
    if (serverStatus !== 'online') return
    
    setIsLoading(true)
    try {
      const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'
      const response = await fetch(`${baseUrl}/api/posts`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
        setError(null)
      } else {
        setError('Failed to fetch posts')
      }
    } catch (err) {
      setError('Error fetching posts: ' + (err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (serverStatus !== 'online') return

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', newPost.title)
      formData.append('content', newPost.content)
      formData.append('category', newPost.category)
      formData.append('author', newPost.author)
      
      if (selectedFile) {
        formData.append('image', selectedFile)
      }

      const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'
      const response = await fetch(`${baseUrl}/api/posts`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        setNewPost({ title: '', content: '', category: 'General', author: 'Yu-Sheng Tzou' })
        setSelectedFile(null)
        await fetchPosts()
        
        // Dispatch event to refresh blog component
        window.dispatchEvent(new CustomEvent('blogPostUpdated'))
        setError(null)
      } else {
        setError('Failed to create post')
      }
    } catch (err) {
      setError('Error creating post: ' + (err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (serverStatus !== 'online') return
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'
      const response = await fetch(`${baseUrl}/api/posts/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchPosts()
        window.dispatchEvent(new CustomEvent('blogPostUpdated'))
        setError(null)
      } else {
        setError('Failed to delete post')
      }
    } catch (err) {
      setError('Error deleting post: ' + (err as Error).message)
    }
  }

  const togglePublished = async (id: number, published: boolean) => {
    if (serverStatus !== 'online') return

    try {
      const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'
      const response = await fetch(`${baseUrl}/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !published })
      })

      if (response.ok) {
        await fetchPosts()
        window.dispatchEvent(new CustomEvent('blogPostUpdated'))
        setError(null)
      } else {
        setError('Failed to update post')
      }
    } catch (err) {
      setError('Error updating post: ' + (err as Error).message)
    }
  }

  // Show login form if not authenticated and admin panel is triggered
  if (!isAuthenticated && isOpen) {
    return <AdminLogin onLogin={handleLogin} isLoading={loginLoading} error={loginError} />
  }

  // Don't render anything if not authenticated and panel is not open
  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      {/* Hidden Admin Panel - Only visible when authenticated */}
      {isAuthenticated && (
        <>
          {/* Small indicator for authenticated admin (optional) */}
          <div className="fixed bottom-6 right-6 w-3 h-3 bg-green-500 rounded-full z-40 opacity-50" title="Admin authenticated - Press Ctrl+Shift+A"></div>

          {/* Admin Panel */}
          {isOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] m-4 overflow-hidden">
                {/* Header */}
                <div className="bg-primary-600 text-white p-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <HiUser className="w-6 h-6 mr-3" />
                    <div>
                      <h2 className="text-2xl font-bold">Admin Panel</h2>
                      <p className="text-primary-100">Welcome back, {currentUser}</p>
                      <p className="text-primary-200 text-sm">Press Ctrl+Shift+A to toggle or ESC to close</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center px-4 py-2 bg-primary-700 hover:bg-primary-800 rounded-lg transition-colors"
                      title="Logout"
                    >
                      <HiLogout className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-2xl hover:bg-primary-700 rounded-lg w-10 h-10 flex items-center justify-center transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  {/* Server Status */}
                  <div className="mb-6 p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Server Status</h3>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          serverStatus === 'online' ? 'bg-green-500' :
                          serverStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}></div>
                        <span className="text-sm font-medium">
                          {serverStatus === 'online' ? 'Online' :
                           serverStatus === 'offline' ? 'Offline' : 'Checking...'}
                        </span>
                      </div>
                    </div>
                    {serverStatus === 'offline' && (
                      <div className="mt-2 text-sm text-red-600">
                        Backend server is not running. Please start the server with: npm run server
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700">{error}</p>
                    </div>
                  )}

                  {serverStatus === 'online' ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Create New Post */}
                      <div>
                        <h3 className="text-xl font-bold mb-4">Create New Post</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <input
                            type="text"
                            placeholder="Post Title"
                            value={newPost.title}
                            onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            required
                          />
                          
                          <select
                            value={newPost.category}
                            onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value="General">General</option>
                            <option value="Technical">Technical</option>
                            <option value="Research">Research</option>
                            <option value="Tutorial">Tutorial</option>
                          </select>

                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          
                          <textarea
                            placeholder="Post Content (Markdown supported)"
                            value={newPost.content}
                            onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg h-32 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            required
                          />
                          
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
                          >
                            {isLoading ? 'Creating...' : 'Create Post'}
                          </button>
                        </form>
                      </div>

                      {/* Manage Posts */}
                      <div>
                        <h3 className="text-xl font-bold mb-4">Manage Posts ({posts.length})</h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {posts.map((post) => (
                            <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 mb-1">{post.title}</h4>
                                  <p className="text-sm text-gray-600 mb-2">{post.category} • {post.readTime}</p>
                                  <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                      post.published 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                      {post.published ? 'Published' : 'Draft'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col space-y-1 ml-4">
                                  <button
                                    onClick={() => togglePublished(post.id, post.published)}
                                    className={`px-3 py-1 text-xs rounded ${
                                      post.published 
                                        ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                                        : 'bg-green-500 text-white hover:bg-green-600'
                                    }`}
                                  >
                                    {post.published ? 'Unpublish' : 'Publish'}
                                  </button>
                                  <button
                                    onClick={() => handleDelete(post.id)}
                                    className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                          {posts.length === 0 && !isLoading && (
                            <p className="text-gray-500 text-center py-8">No posts found</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">⚠️</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Server Offline</h3>
                      <p className="text-gray-600">Please start the backend server to manage blog posts.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}

export default AdminPanel 