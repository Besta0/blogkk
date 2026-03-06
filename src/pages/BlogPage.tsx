import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, Eye, ArrowLeft, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'
import { useBlogPosts, useBlogTags } from '../api/hooks/useBlog'
import BlogPost from '../components/BlogPost'
import LazyImage from '../components/LazyImage'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import type { BlogPost as BlogPostType } from '../api/types'

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const TAG_COLORS = [
  'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
]

const getTagColor = (tag: string) => {
  let hash = 0
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}

const PostRowSkeleton = () => (
  <div className="flex gap-6 p-6 border border-gray-200 dark:border-gray-700 rounded-xl animate-pulse bg-white dark:bg-gray-800/50">
    <div className="flex-shrink-0 w-64 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
    <div className="flex-1 min-w-0 py-2">
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
      <div className="h-7 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
      <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  </div>
)

interface PostRowProps {
  post: BlogPostType
  onClick: (post: BlogPostType) => void
}

const PostRow = ({ post, onClick }: PostRowProps) => (
  <motion.article
    className="group cursor-pointer"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    onClick={() => onClick(post)}
  >
    <div className="flex gap-6 p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800/50">
      <div className="flex-shrink-0 w-64 h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
        <motion.div className="w-full h-full" whileHover={{ scale: 1.06 }} transition={{ duration: 0.4 }}>
          <LazyImage
            src={post.featuredImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=400&fit=crop'}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>

      <div className="flex-1 min-w-0 py-2">
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {post.tags.map((tag) => (
            <span key={tag} className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)}`}>
              {tag}
            </span>
          ))}
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2 line-clamp-2 leading-snug">
          {post.title}
        </h2>

        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Published {formatDate(post.publishedAt || post.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {post.readTime} min read
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            {post.views} views
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
          {post.excerpt}
        </p>
      </div>
    </div>
  </motion.article>
)

interface PaginationProps {
  currentPage: number
  totalPages: number
  onChange: (page: number) => void
}

const Pagination = ({ currentPage, totalPages, onChange }: PaginationProps) => {
  const pages = useMemo(() => {
    const arr: (number | '...')[] = []
    if (totalPages <= 8) {
      for (let i = 1; i <= totalPages; i++) arr.push(i)
    } else {
      arr.push(1)
      if (currentPage > 3) arr.push('...')
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) arr.push(i)
      if (currentPage < totalPages - 2) arr.push('...')
      arr.push(totalPages)
    }
    return arr
  }, [currentPage, totalPages])

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-sm text-gray-400">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
              p === currentPage
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next page
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

interface BlogPageProps {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const BlogPage = ({ theme, toggleTheme }: BlogPageProps) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPost, setSelectedPost] = useState<BlogPostType | null>(null)
  const postsPerPage = 5

  // Check if URL already has a slug on mount (e.g. /blog/my-post)
  const initialSlug = useMemo(() => {
    const parts = window.location.pathname.split('/')
    return parts.length >= 3 && parts[1] === 'blog' && parts[2] ? parts[2] : null
  }, [])

  // Listen for browser back/forward button
  useEffect(() => {
    const handlePopState = () => {
      const parts = window.location.pathname.split('/')
      const slug = parts.length >= 3 && parts[1] === 'blog' && parts[2] ? parts[2] : null
      if (!slug) {
        // Back to /blog list
        setSelectedPost(null)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const { data: postsData, isLoading } = useBlogPosts({
    page: currentPage,
    limit: postsPerPage,
    tag: selectedTag || undefined,
  })

  const { data: tagsData } = useBlogTags()

  const posts = useMemo(() => postsData?.posts || [], [postsData?.posts])
  const totalPages = postsData?.totalPages ?? 1
  const totalPosts = postsData?.total ?? 0
  const tags = useMemo(() => tagsData?.tags || [], [tagsData?.tags])

  const handleTagClick = useCallback((tag: string | null) => {
    setSelectedTag(tag)
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleBackToHome = () => {
    window.history.pushState({}, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  const handlePostClick = (post: BlogPostType) => {
    setSelectedPost(post)
    window.history.pushState({}, '', `/blog/${post.slug}`)
  }

  const handleBackToBlog = () => {
    window.location.href = '/blog'
  }

  // Show post if selected or if URL has a slug
  if (selectedPost || initialSlug) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar theme={theme} toggleTheme={toggleTheme} onHomeClick={handleBackToHome} />
        <BlogPost
          slug={selectedPost?.slug ?? initialSlug ?? undefined}
          post={selectedPost ?? undefined}
          onBack={handleBackToBlog}
        />
        <Footer />
      </div>
    )
  }

  const start = (currentPage - 1) * postsPerPage + 1
  const end = Math.min(currentPage * postsPerPage, totalPosts)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Navbar theme={theme} toggleTheme={toggleTheme} onHomeClick={handleBackToHome} />

      
      <div className="flex-1 max-w-8xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">

        <button
          onClick={handleBackToHome}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors mb-8 group text-sm"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <BookOpen className="w-7 h-7 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blog Posts</h1>
          </div>
          {!isLoading && totalPosts > 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-sm ml-10">
              Showing {start}–{end} of {totalPosts} posts
              {selectedTag && (
                <span> in tag <span className="font-medium text-blue-500">#{selectedTag}</span></span>
              )}
            </p>
          )}
        </div>

        {/* Tag filter */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => handleTagClick(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                selectedTag === null
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent'
                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 bg-white dark:bg-transparent'
              }`}
            >
              All
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  selectedTag === tag
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 bg-white dark:bg-transparent'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Pagination top */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center mb-6 py-3 border-y border-gray-200 dark:border-gray-700">
            <Pagination currentPage={currentPage} totalPages={totalPages} onChange={handlePageChange} />
          </div>
        )}

        {/* Post list */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: postsPerPage }).map((_, i) => <PostRowSkeleton key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 text-gray-400"
          >
            <p className="text-lg mb-4">No posts found</p>
            <button
              onClick={() => handleTagClick(null)}
              className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-medium transition-colors"
            >
              View all posts
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentPage}-${selectedTag}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {posts.map((post) => (
                <PostRow key={post.id} post={post} onClick={handlePostClick} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination bottom */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Pagination currentPage={currentPage} totalPages={totalPages} onChange={handlePageChange} />
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default BlogPage
