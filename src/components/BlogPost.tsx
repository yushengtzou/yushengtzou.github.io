import { useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import rehypeKatex from 'rehype-katex'
import 'prismjs/themes/prism-tomorrow.css'
import 'katex/dist/katex.min.css'

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

interface BlogPostProps {
  post: BlogPost
  onBack: () => void
}

const BlogPost = ({ post, onBack }: BlogPostProps) => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="mr-2 text-lg">←</span>
              Back to Blog
            </button>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                {post.category}
              </span>
              <span>{post.readTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article header */}
        <header className="mb-8">
          {post.image && (
            <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-64 md:h-80 object-cover"
              />
            </div>
          )}
          
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex items-center justify-center space-x-4 text-gray-600 text-lg pt-10">
              <span className="flex items-center">
                <span className="mr-1">👤</span>
                {post.author}
              </span>
              <span className="flex items-center">
                <span className="mr-1">📅</span>
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Article content */}
        <article className="max-w-none">
          <div className="p-8 md:p-12 lg:p-16">
            <div className="prose prose-xl md:prose-2xl max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeHighlight, rehypeRaw, rehypeKatex]}
                components={{
                  // Custom styling for different elements
                  h1: ({ children }) => (
                    <h1 className="text-4xl font-bold text-gray-900 mb-8 mt-12 pb-4 border-b border-gray-200">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-10">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                      {children}
                    </p>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary-400 pl-6 my-8 bg-gray-50 py-4 rounded-r text-lg">
                      <div className="text-gray-700 italic">
                        {children}
                      </div>
                    </blockquote>
                  ),
                  code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '')
                    const isInline = !match
                    
                    if (isInline) {
                      return (
                        <code className="bg-gray-100 text-primary-600 px-2 py-1 rounded text-base font-mono" {...props}>
                          {children}
                        </code>
                      )
                    }
                    
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  },
                  pre: ({ children }) => (
                    <pre className="bg-gray-900 text-gray-100 rounded-lg p-6 overflow-x-auto my-8 border text-base">
                      {children}
                    </pre>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-3 my-6 text-gray-700 text-lg">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-3 my-6 text-gray-700 text-lg">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">
                      {children}
                    </li>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 underline underline-offset-2 transition-colors"
                    >
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-8">
                      <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-gray-50">
                      {children}
                    </thead>
                  ),
                  th: ({ children }) => (
                    <th className="px-6 py-4 text-left text-base font-semibold text-gray-900 border-b border-gray-300">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-6 py-4 text-base text-gray-700 border-b border-gray-200">
                      {children}
                    </td>
                  ),
                  img: ({ src, alt }) => (
                    <div className="my-8">
                      <img
                        src={src}
                        alt={alt}
                        className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                      />
                    </div>
                  ),
                  hr: () => (
                    <hr className="my-12 border-gray-300" />
                  )
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </div>
        </article>

        {/* Footer with back button */}
        <div className="mt-12 text-center">
          <button
            onClick={onBack}
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-md"
          >
            <span className="mr-2">←</span>
            Back to Blog
          </button>
        </div>
      </div>
    </div>
  )
}

export default BlogPost 