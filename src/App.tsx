import { useEffect, useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Experience from './components/Experience'
import Blog from './components/Blog'
import Contact from './components/Contact'
import Footer from './components/Footer'
import AdminPanel from './components/AdminPanel'

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

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'blogPost'>('home')
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Intersection Observer for scroll animations
    const observeElements = () => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible')
            }
          })
        },
        { threshold: 0.1, rootMargin: '50px' }
      )

      const animatedElements = document.querySelectorAll('.animate-on-scroll')
      animatedElements.forEach((el) => observer.observe(el))

      return () => observer.disconnect()
    }

    const cleanup = observeElements()
    return cleanup
  }, [])

  useEffect(() => {
    // Re-trigger animations when view changes
    if (currentView === 'home') {
      setTimeout(() => {
        const animatedElements = document.querySelectorAll('.animate-on-scroll:not(.visible)')
        animatedElements.forEach((el) => {
          el.classList.add('visible')
        })
      }, 100)
    }
  }, [currentView])

  const handleViewPost = (post: BlogPost) => {
    setSelectedPost(post)
    setCurrentView('blogPost')
    window.scrollTo(0, 0)
  }

  const handleBackToHome = () => {
    setCurrentView('home')
    setSelectedPost(null)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (currentView === 'blogPost' && selectedPost) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-16">
          <div className="max-w-4xl mx-auto container-padding py-16">
            <button
              onClick={handleBackToHome}
              className="mb-8 inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
            >
              <span className="mr-2">←</span>
              Back to Home
            </button>
            
            <article className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {selectedPost.image && (
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  className="w-full h-64 object-cover"
                />
              )}
              
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                    {selectedPost.category}
                  </span>
                  <span className="text-gray-500 text-sm">{selectedPost.readTime}</span>
                  <span className="text-gray-500 text-sm">
                    {new Date(selectedPost.date).toLocaleDateString()}
                  </span>
                </div>
                
                <h1 className="text-4xl font-bold text-gray-900 mb-6">
                  {selectedPost.title}
                </h1>
                
                <div className="prose prose-lg max-w-none">
                  <p className="text-xl text-gray-600 mb-8">{selectedPost.excerpt}</p>
                  <div className="whitespace-pre-wrap">{selectedPost.content}</div>
                </div>
              </div>
            </article>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <About />
        <Experience />
        <Blog onViewPost={handleViewPost} />
        <Contact />
      </main>
      <Footer />
      <AdminPanel />
    </div>
  )
}

export default App 