import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { Calendar, Clock, Eye, ArrowRight } from 'lucide-react'
import { useRecentBlogPosts } from '../api/hooks/useBlog'
import LazyImage from './LazyImage'
import type { BlogPost } from '../api/types'

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

interface LatestBlogSectionProps {
  onPostClick: (post: BlogPost) => void
  onViewAllClick: () => void
}

const LatestBlogSection = ({ onPostClick, onViewAllClick }: LatestBlogSectionProps) => {
  const { data: recentData, isLoading } = useRecentBlogPosts(3)
  const recentPosts = useMemo(() => recentData?.posts || [], [recentData?.posts])

  if (isLoading) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-8 animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-6 p-6 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse">
                <div className="w-64 h-48 flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-600 rounded mb-3" />
                  <div className="h-4 w-full bg-gray-300 dark:bg-gray-600 rounded mb-2" />
                  <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-600 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (recentPosts.length === 0) {
    return null
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Latest Blog Posts
          </h2>
          <button
            onClick={onViewAllClick}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {recentPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onPostClick(post)}
              className="group cursor-pointer"
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

                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default LatestBlogSection
