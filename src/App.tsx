import { useState, useEffect, lazy, Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import ProjectsSection from './components/ProjectsSection'
import BlogSection from './components/BlogSection'
import BlogPost from './components/BlogPost'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'
import AdminDashboard from './admin'
import OfflineIndicator from './components/OfflineIndicator'
import type { BlogPost as BlogPostType } from './api/types'

// 懒加载测试页面
const TestPage = lazy(() => import('./pages/TestPage'))

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPostType | null>(null)
  
  // Initialize route state based on current hash
  const [currentRoute, setCurrentRoute] = useState(() => {
    const hash = window.location.hash.toLowerCase()
    console.log('Initial hash:', hash)
    if (hash.includes('admin')) return 'admin'
    if (hash.includes('test')) return 'test'
    return 'main'
  })

  // Check for route on mount and hash change
  useEffect(() => {
    const checkRoute = () => {
      const hash = window.location.hash.toLowerCase()
      console.log('Current hash:', hash)
      if (hash.includes('admin')) {
        console.log('Routing to admin')
        setCurrentRoute('admin')
      } else if (hash.includes('test')) {
        console.log('Routing to test')
        setCurrentRoute('test')
      } else {
        console.log('Routing to main')
        setCurrentRoute('main')
        // Reset blog post selection when navigating to main
        setSelectedBlogPost(null)
      }
    }
    
    checkRoute()
    window.addEventListener('hashchange', checkRoute)
    window.addEventListener('popstate', checkRoute)
    
    return () => {
      window.removeEventListener('hashchange', checkRoute)
      window.removeEventListener('popstate', checkRoute)
    }
  }, [])

  useEffect(() => {
    // 检查系统主题偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      setTheme(prefersDark ? 'dark' : 'light')
    }
  }, [])

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])


  // Scroll to top when viewing a blog post
  useEffect(() => {
    if (selectedBlogPost) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [selectedBlogPost])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const handleHomeClick = () => {
    setSelectedBlogPost(null)
    // Also clear any hash in the URL
    window.location.hash = ''
  }

  const handleBlogPostClick = (post: BlogPostType) => {
    setSelectedBlogPost(post)
  }

  const handleBackToBlog = () => {
    setSelectedBlogPost(null)
  }

  // Render based on current route
  if (currentRoute === 'admin') {
    return <AdminDashboard />
  }

  if (currentRoute === 'test') {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      }>
        <TestPage />
      </Suspense>
    )
  }


  return (
      <div className="min-h-screen relative overflow-x-hidden">
        <OfflineIndicator />
        <Navbar theme={theme} toggleTheme={toggleTheme} onHomeClick={handleHomeClick} />
        <AnimatePresence mode="wait">
          {selectedBlogPost ? (
            <BlogPost
              key="blog-post"
              post={selectedBlogPost}
              onBack={handleBackToBlog}
            />
          ) : ( 
            <>
              <HeroSection />
              <AboutSection />
              <ProjectsSection />
              <BlogSection onPostClick={handleBlogPostClick} />
              <ContactSection />
            </>
          )}
        </AnimatePresence>
        <Footer />
      </div>

    

  )
}

export default App
