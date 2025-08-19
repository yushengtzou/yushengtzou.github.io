import { useEffect } from 'react'

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

interface BlogPostViewProps {
  post: BlogPost
  onBack: () => void
}

const BlogPostView = ({ post, onBack }: BlogPostViewProps) => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Enhanced markdown to HTML conversion
  const renderContent = (content: string) => {
    // Remove frontmatter if present
    const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\s*/, '')
    
    // Convert markdown to HTML
    let html = contentWithoutFrontmatter
      // Headers
      .replace(/^#### (.*$)/gim, '<h4 class="text-lg font-bold mt-4 mb-2">$1</h4>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
      // Lists
      .replace(/^\* (.+)$/gim, '<li class="ml-6 mb-2">• $1</li>')
      .replace(/^\d+\. (.+)$/gim, '<li class="ml-6 mb-2">$1</li>')
      // Bold and italic
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong class="font-bold italic">$1</strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="my-6 mx-auto max-w-full rounded-lg shadow-lg" />')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary-600 hover:text-primary-700 underline" target="_blank" rel="noopener noreferrer">$1</a>')
      // Blockquotes
      .replace(/^> (.+)$/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-4">$1</blockquote>')
      // Horizontal rules
      .replace(/^---$/gim, '<hr class="my-8 border-gray-300" />')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      // Line breaks
      .replace(/\r\n\r\n/g, '</p><p class="mb-4 text-gray-700 leading-relaxed">')
      .replace(/\n\n/g, '</p><p class="mb-4 text-gray-700 leading-relaxed">')
    
    // Wrap in paragraph tags
    html = '<p class="mb-4 text-gray-700 leading-relaxed">' + html + '</p>'
    
    // Wrap lists
    html = html.replace(/(<li class="ml-6 mb-2">.*<\/li>\s*)+/g, '<ul class="my-4">$&</ul>')
    
    return html
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full">
                {post.category}
              </span>
              <span className="text-sm text-gray-500">{post.readTime}</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {post.title}
            </h1>
            <div className="flex items-center justify-center text-gray-600 space-x-4">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {post.author}
              </span>
              <span>•</span>
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(post.date)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {post.image && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-8">
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-auto rounded-xl shadow-2xl"
          />
        </div>
      )}

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
        />
      </article>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <p className="text-gray-600">Thanks for reading!</p>
              <p className="text-sm text-gray-500 mt-1">
                Published in <span className="font-semibold">{post.category}</span> by {post.author}
              </p>
            </div>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              Back to All Posts
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogPostView