import { useState, useEffect, lazy, Suspense } from 'react'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import LatestBlogSection from './components/LatestBlogSection'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'
import AdminDashboard from './admin'
import OfflineIndicator from './components/OfflineIndicator'
import type { BlogPost as BlogPostType } from './api/types'

const TestPage = lazy(() => import('./pages/TestPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))

const getRoute = () => {
  const pathname = window.location.pathname.toLowerCase()
  const hash = window.location.hash.toLowerCase()
  if (pathname === '/blog' || pathname.startsWith('/blog/')) return 'blog'
  if (pathname === '/projects') return 'projects'
  if (hash.includes('admin')) return 'admin'
  if (hash.includes('test')) return 'test'
  return 'main'
}

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [currentRoute, setCurrentRoute] = useState(getRoute)

  useEffect(() => {
    const checkRoute = () => {
      const route = getRoute()
      setCurrentRoute(route)
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

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const handleHomeClick = () => {
    window.location.hash = ''
  }

  const handleBlogPostClick = (post: BlogPostType) => {
    // Navigate to blog page with the post slug
    window.location.href = `/blog/${post.slug}`
  }

  const handleBackToBlog = () => {
    window.location.href = '/blog'
  }

  const pageFallback = (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>
  )

  if (currentRoute === 'admin') {
    return <AdminDashboard />
  }

  if (currentRoute === 'test') {
    return (
      <Suspense fallback={pageFallback}>
        <TestPage />
      </Suspense>
    )
  }

  if (currentRoute === 'blog') {
    return (
      <Suspense fallback={pageFallback}>
        <BlogPage theme={theme} toggleTheme={toggleTheme} />
      </Suspense>
    )
  }

  if (currentRoute === 'projects') {
    return (
      <Suspense fallback={pageFallback}>
        <ProjectsPage theme={theme} toggleTheme={toggleTheme} />
      </Suspense>
    )
  }


  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <OfflineIndicator />
      <Navbar theme={theme} toggleTheme={toggleTheme} onHomeClick={handleHomeClick} />
      <HeroSection />
      <AboutSection />
      <LatestBlogSection
        onPostClick={handleBlogPostClick}
        onViewAllClick={() => window.location.pathname = '/blog'}
      />
      <ContactSection />
      <Footer />
    </div>

    

  )
}

export default App
