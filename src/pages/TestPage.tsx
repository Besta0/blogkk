/**
 * 测试页面 - 使用真实 API 数据展示关于、项目、博客部分
 * 访问路径: /#/test
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Eye, Heart, Calendar, Clock, Search, Tag, Github, ExternalLink } from 'lucide-react'
import { useProfile } from '../api/hooks/useProfile'
import { useProjects, useTechnologies, useLikeProject, useRecordProjectView } from '../api/hooks/useProjects'
import { useBlogPosts, useBlogTags } from '../api/hooks/useBlog'
import LazyImage from '../components/LazyImage'
import type { Project, BlogPost } from '../api/types'

// 关于部分组件
function TestAboutSection() {
  const { data: profile, isLoading } = useProfile()

  if (isLoading) {
    return (
      <section id="about" className="min-h-screen py-20 px-4 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </section>
    )
  }

  if (!profile) {
    return (
      <section id="about" className="min-h-screen py-20 px-4 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">无法加载个人信息</p>
      </section>
    )
  }

  return (
    <section id="about" className="min-h-screen py-20 px-4 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">关于我</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">了解更多关于我的背景和技能</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.02 }}
            >
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-48 h-48 rounded-full mx-auto mb-6 border-4 border-blue-500 shadow-xl object-cover"
              />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h3>
              <p className="text-blue-500 dark:text-blue-400 font-medium">{profile.title}</p>
            </motion.div>

            <div>
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 leading-relaxed">
                {profile.bio}
              </p>
              {profile.skills && profile.skills.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">技能</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-medium"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// 项目部分组件
function TestProjectsSection() {
  const [selectedTech, setSelectedTech] = useState<string | null>(null)
  const { data: projectsData, isLoading } = useProjects({ limit: 20, technology: selectedTech || undefined })
  const { data: technologiesData } = useTechnologies()
  const likeMutation = useLikeProject()
  const recordViewMutation = useRecordProjectView()

  const projects = projectsData?.projects || []
  const technologies = technologiesData?.technologies || []

  const handleLike = (id: string) => {
    likeMutation.mutate(id)
  }

  if (isLoading) {
    return (
      <section id="projects" className="min-h-screen py-20 px-4 bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </section>
    )
  }

  return (
    <section id="projects" className="min-h-screen py-20 px-4 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">精选项目</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              探索我的最新作品，每一个项目都是创意与技术的完美结合
            </p>
          </div>

          {/* 技术筛选 */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => setSelectedTech(null)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedTech === null
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              全部
            </button>
            {technologies.slice(0, 8).map(tech => (
              <button
                key={tech}
                onClick={() => setSelectedTech(tech)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedTech === tech
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>

          {/* 项目网格 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {projects.map((project: Project, index: number) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg cursor-pointer"
                  onClick={() => recordViewMutation.mutate(project.id)}
                >
                  <div className="relative h-48">
                    <LazyImage
                      src={project.images[0] || 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=400&fit=crop'}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                    {project.featured && (
                      <span className="absolute top-4 left-4 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-full">
                        精选
                      </span>
                    )}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <span className="flex items-center gap-1 px-2 py-1 bg-black/40 text-white rounded-full text-xs">
                        <Eye className="w-3 h-3" /> {project.views}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLike(project.id)
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-black/40 text-white rounded-full text-xs hover:bg-red-500/70 transition-colors"
                      >
                        <Heart className="w-3 h-3" /> {project.likes}
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{project.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map(tech => (
                        <span key={tech} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                          <Github className="w-4 h-4" /> 代码
                        </a>
                      )}
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
                          <ExternalLink className="w-4 h-4" /> 演示
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {projects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">没有找到匹配的项目</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

// 博客部分组件
function TestBlogSection() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { data: postsData, isLoading } = useBlogPosts({
    page: 1,
    limit: 9,
    tag: selectedTag || undefined,
    search: searchQuery || undefined,
  })
  const { data: tagsData } = useBlogTags()

  const posts = postsData?.posts || []
  const tags = tagsData?.tags || []

  if (isLoading) {
    return (
      <section id="blog" className="min-h-screen py-20 px-4 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </section>
    )
  }

  return (
    <section id="blog" className="min-h-screen py-20 px-4 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">技术博客</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              分享技术见解、开发经验和学习心得
            </p>
          </div>

          {/* 搜索框 */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索文章..."
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* 标签筛选 */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => setSelectedTag(null)}
              className={`flex items-center gap-1 px-4 py-2 rounded-full font-medium transition-all ${
                selectedTag === null
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Tag className="w-4 h-4" /> 全部
            </button>
            {tags.slice(0, 6).map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedTag === tag
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* 博客文章网格 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {posts.map((post: BlogPost, index: number) => (
                <motion.article
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg cursor-pointer"
                >
                  <div className="relative h-48">
                    <LazyImage
                      src={post.featuredImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop'}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-black/40 text-white rounded-full text-xs">
                      <Clock className="w-3 h-3" /> {post.readTime} 分钟
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-blue-500 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> {new Date(post.publishedAt || post.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" /> {post.views}
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          {posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">没有找到匹配的文章</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

// 主测试页面
export default function TestPage() {
  const goBack = () => {
    window.location.hash = ''
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              返回主页
            </button>
            <span className="text-xl font-bold text-gradient">测试预览</span>
          </div>
          <div className="flex gap-6">
            <a href="#about" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">关于</a>
            <a href="#projects" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">项目</a>
            <a href="#blog" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">博客</a>
          </div>
        </div>
      </nav>

      {/* 顶部提示 */}
      <div className="pt-20 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 px-4 text-center">
        <p className="font-medium">🧪 这是测试预览页面 - 使用真实数据库数据展示关于、项目、博客三个部分</p>
      </div>

      {/* 内容区域 */}
      <TestAboutSection />
      <TestProjectsSection />
      <TestBlogSection />

      {/* 页脚 */}
      <footer className="py-8 px-4 bg-gray-100 dark:bg-gray-800 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          测试页面 - 数据来自数据库，与主页保持一致
        </p>
      </footer>
    </div>
  )
}
