import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo, memo, useCallback } from 'react'
import { Calendar, Clock, Eye, Tag, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useBlogPosts, useBlogTags } from '../api/hooks/useBlog'
import LazyImage from './LazyImage'
import type { BlogPost } from '../api/types'

// Format date to readable string
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Loading skeleton component - memoized for performance
const BlogSkeleton = memo(function BlogSkeleton() {
  return (
    <section
      id="blog"
      className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto animate-pulse">
        <div className="text-center mb-16">
          <div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-4" />
          <div className="h-6 w-96 max-w-full bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl overflow-hidden glass">
              <div className="h-48 bg-gray-200 dark:bg-gray-700" />
              <div className="p-6">
                <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                <div className="flex gap-2">
                  {[1, 2].map((j) => (
                    <div key={j} className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

// Blog post card component - memoized for performance
interface BlogCardProps {
  post: BlogPost
  onClick: (post: BlogPost) => void
}

const BlogCard = memo(function BlogCard({ post, onClick }: BlogCardProps) {
  const handleClick = useCallback(() => {
    onClick(post)
  }, [onClick, post])

  return (
    <motion.article
      className="group cursor-pointer h-full"
      whileHover={{ y: -8 }}
      onClick={handleClick}
    >
      <div className="h-full rounded-2xl overflow-hidden bg-white/80 dark:bg-white/5 backdrop-blur-md hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300 flex flex-col border-2 border-gray-200 dark:border-gray-700">
        {/* Featured image with lazy loading */}
        <div className="relative h-48 overflow-hidden">
          <motion.div
            className="w-full h-full"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <LazyImage
              src={post.featuredImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop'}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Read time badge */}
          <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 text-white text-xs">
            <Clock className="w-3 h-3" />
            {post.readTime} min
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm">
            {post.excerpt}
          </p>

          {/* Meta info */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-auto">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(post.publishedAt || post.createdAt)}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {post.views}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  )
})

interface BlogSectionProps {
  onPostClick?: (post: BlogPost) => void
}

const BlogSection = ({ onPostClick }: BlogSectionProps) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 6

  // Fetch blog posts
  const {
    data: postsData,
    isLoading,
  } = useBlogPosts({
    page: currentPage,
    limit: postsPerPage,
    tag: selectedTag || undefined,
    search: searchQuery || undefined,
  })

  // Fetch tags
  const { data: tagsData } = useBlogTags()

  // Use API data
  const posts = useMemo(() => {
    return postsData?.posts || []
  }, [postsData?.posts])

  const totalPages = postsData?.totalPages ?? 1

  // Get unique tags
  const tags = useMemo(() => {
    return tagsData?.tags || []
  }, [tagsData?.tags])

  const handlePostClick = useCallback((post: BlogPost) => {
    if (onPostClick) {
      onPostClick(post)
    }
  }, [onPostClick])

  const handleTagClick = useCallback((tag: string | null) => {
    setSelectedTag(tag)
    setCurrentPage(1)
  }, [])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  }

  if (isLoading) {
    return <BlogSkeleton />
  }

  // Always use default data when there's an error - don't show error page

  return (
    <section
      id="blog"
      className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">Tech Blog</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Sharing technical insights, development experience and learnings
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.form
            variants={itemVariants}
            onSubmit={handleSearch}
            className="max-w-md mx-auto mb-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-12 pr-4 py-3 rounded-full glass border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500"
              />
            </div>
          </motion.form>

          {/* Tag filters */}
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => handleTagClick(null)}
              className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedTag === null
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'glass hover:bg-white/20 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Tag className="w-4 h-4" />
              All
            </button>
            {tags.slice(0, 6).map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedTag === tag
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'glass hover:bg-white/20 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </motion.div>

          {/* Blog posts grid */}
          <div className="h-[650px] mb-12 flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-max flex-grow">
              <AnimatePresence mode="popLayout">
                {posts.map((post) => (
                  <motion.div
                    key={post.id}
                    variants={itemVariants}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <BlogCard post={post} onClick={handlePostClick} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Empty state */}
          {posts.length === 0 && (
            <motion.div variants={itemVariants} className="text-center py-16">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No matching articles found
              </p>
              <button
                onClick={() => {
                  setSelectedTag(null)
                  setSearchQuery('')
                }}
                className="mt-4 px-6 py-2 rounded-full glass hover:bg-white/20 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-all duration-300"
              >
                查看All文章
              </button>
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div variants={itemVariants} className="flex justify-center items-center gap-4 px-6 py-4 rounded-full bg-gray-100 dark:bg-gray-800 w-fit mx-auto">
              <motion.button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </motion.button>
              <span className="text-gray-600 dark:text-gray-400 font-medium text-sm px-2">
                {currentPage} / {totalPages}
              </span>
              <motion.button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

export default BlogSection
