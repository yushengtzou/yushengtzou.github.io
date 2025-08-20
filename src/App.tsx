import { useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Experience from './components/Experience'
import Blog from './components/Blog'

import Footer from './components/Footer'
import AdminPanel from './components/AdminPanel'
import BlogPost from './components/BlogPost'

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
  image?: string
}

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'blogPost'>('home')
  const [selectedPost, setSelectedPost] = useState<BlogPostType | null>(null)
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

  const handleViewPost = (post: BlogPostType) => {
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
      <>
        <BlogPost post={selectedPost} onBack={handleBackToHome} />
        <Analytics />
      </>
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
        {/* <Contact /> */}
      </main>
      <Footer />
      <AdminPanel />
      <Analytics />
    </div>
  )
}

export default App 