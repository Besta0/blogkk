import { motion } from 'framer-motion'
import { useEffect, useState, useCallback, useRef } from 'react'
import { Calendar, Clock, Eye, Tag, ArrowLeft, AlertCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useBlogPost } from '../api/hooks/useBlog'
import type { BlogPost as BlogPostType } from '../api/types'

// Format date to readable string
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Loading skeleton
const BlogPostSkeleton = () => (
  <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-8" />
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-8" />
      <div className="h-10 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="flex gap-4 mb-8">
        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>
    </div>
  </div>
)

// Error display
const BlogPostError = ({ message, onBack }: { message: string; onBack: () => void }) => (
  <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center glass rounded-2xl p-8 max-w-md">
      <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Unable to load article
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
      <button
        onClick={onBack}
        className="px-6 py-2.5 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-950 font-semibold hover:opacity-90 transition-opacity"
      >
        Back to Blog
      </button>
    </div>
  </div>
)

interface BlogPostProps {
  slug?: string
  post?: BlogPostType
  onBack: () => void
}

interface Heading {
  id: string
  text: string
  level: number
}

const BlogPost = ({ slug, post: initialPost, onBack }: BlogPostProps) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [scrollProgress, setScrollProgress] = useState(0)

  // Fetch post by slug if not provided directly
  const { data: fetchedPost, isLoading, isError, error } = useBlogPost(slug || '')

  // Extract headings from markdown content
  useEffect(() => {
    const postContent = initialPost || fetchedPost
    if (!postContent?.content) return

    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const extractedHeadings: Heading[] = []
    let match

    while ((match = headingRegex.exec(postContent.content)) !== null) {
      const level = match[1].length
      const text = match[2].trim()
      const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      extractedHeadings.push({ id, text, level })
    }

    setHeadings(extractedHeadings)
  }, [initialPost, fetchedPost])

  // Update active heading and scroll progress on scroll
  const handleScroll = useCallback(() => {
    if (!contentRef.current) return

    const content = contentRef.current
    const contentTop = content.offsetTop
    const contentHeight = content.scrollHeight
    const viewportHeight = window.innerHeight

    // Calculate scroll progress
    const scrollTop = window.scrollY - contentTop
    const progress = Math.max(0, Math.min(100, (scrollTop / (contentHeight - viewportHeight)) * 100))
    setScrollProgress(progress)

    // Find active heading
    const headingElements = headings.map(heading => ({
      id: heading.id,
      element: document.getElementById(heading.id)
    }))

    let activeHeadingId = ''
    for (const { id, element } of headingElements) {
      if (element) {
        const rect = element.getBoundingClientRect()
        if (rect.top <= 150) {
          activeHeadingId = id
        }
      }
    }

    if (activeHeadingId) {
      setActiveId(activeHeadingId)
    }
  }, [headings])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const scrollToHeading = useCallback((id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      })
    }
  }, [])

  // Use provided post or fetched post
  const post = initialPost || fetchedPost

  if (isLoading && !initialPost) {
    return <BlogPostSkeleton />
  }

  if ((isError || !post) && !initialPost) {
    return (
      <BlogPostError
        message={error instanceof Error ? error.message : 'Article does not exist or has been deleted'}
        onBack={onBack}
      />
    )
  }

  if (!post) {
    return <BlogPostSkeleton />
  }

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900"
    >
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 z-50">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto flex gap-8">
        {/* Main content */}
        <div className="flex-1 max-w-4xl">
          {/* Back button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Blog
          </motion.button>

        {/* Featured image */}
        {post.featuredImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8"
          >
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </motion.div>
        )}

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {post.title}
          </h1>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-6 text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {formatDate(post.publishedAt || post.createdAt)}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {post.readTime} min read
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              {post.views} views
            </div>
          </div>
        </motion.header>

        {/* Content */}
        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-p:text-gray-600 dark:prose-p:text-gray-300
            prose-a:text-blue-500 hover:prose-a:text-blue-600
            prose-strong:text-gray-900 dark:prose-strong:text-white
            prose-code:text-emerald-700 dark:prose-code:text-emerald-400
            prose-code:bg-emerald-50 dark:prose-code:bg-gray-800
            prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-emerald-50 prose-pre:border prose-pre:border-emerald-200
            dark:prose-pre:bg-gray-900 dark:prose-pre:border-gray-700
            prose-pre:text-emerald-800 dark:prose-pre:text-gray-100
            prose-blockquote:border-blue-500
            prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20
            prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
            prose-img:rounded-xl prose-img:shadow-lg
            prose-hr:border-gray-200 dark:prose-hr:border-gray-700
            prose-table:border-collapse
            prose-th:bg-gray-100 dark:prose-th:bg-gray-800
            prose-th:border prose-th:border-gray-200 dark:prose-th:border-gray-700
            prose-th:px-4 prose-th:py-2
            prose-td:border prose-td:border-gray-200 dark:prose-td:border-gray-700
            prose-td:px-4 prose-td:py-2
            prose-ul:list-disc prose-ol:list-decimal
            prose-li:text-gray-600 dark:prose-li:text-gray-300
            prose-h2:before:content-none prose-h3:before:content-none
            prose-h2:scroll-mt-24 prose-h3:scroll-mt-24"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ node, ...props }) => (
                <h2 {...props} id={props.children?.toString()?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')} />
              ),
              h3: ({ node, ...props }) => (
                <h3 {...props} id={props.children?.toString()?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')} />
              ),
              h4: ({ node, ...props }) => (
                <h4 {...props} id={props.children?.toString()?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')} />
              ),
              h5: ({ node, ...props }) => (
                <h5 {...props} id={props.children?.toString()?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')} />
              ),
              h6: ({ node, ...props }) => (
                <h6 {...props} id={props.children?.toString()?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')} />
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 rounded-xl glass hover:bg-white/20 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Blog
          </button>
        </motion.footer>
        </div>

        {/* Table of Contents */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="hidden lg:block w-72 sticky top-24 h-fit max-h-[calc(100vh-100px)] overflow-y-auto"
        >
          <nav className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
              Table of Contents
            </h3>
            <ul className="space-y-2">
              {headings.map((heading) => (
                <li key={heading.id}>
                  <button
                    onClick={() => scrollToHeading(heading.id)}
                    className={`w-full text-left text-sm transition-all duration-200 hover:text-indigo-500 dark:hover:text-indigo-400 ${
                      activeId === heading.id
                        ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-l-2 border-indigo-500 pl-3'
                        : `text-gray-600 dark:text-gray-400 ${
                            heading.level === 2 ? 'ml-0' : heading.level === 3 ? 'ml-4' : 'ml-8'
                          }`
                    }`}
                  >
                    {heading.text}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </motion.aside>
      </div>
    </motion.article>
  )
}

export default BlogPost
