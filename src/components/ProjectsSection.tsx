import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { ExternalLink, Github } from 'lucide-react'
import MagneticButton from './MagneticButton'

interface Project {
  title: string
  description: string
  tags: string[]
  image: string
  github?: string
  demo?: string
  color: string
}

const ProjectsSection = () => {
  const ref = useRef(null)
  // 每次进入/离开视口都触发（支持反复滚动时重复播放动画）
  const isInView = useInView(ref, { once: false, margin: '-100px' })

  const projects: Project[] = [
    {
      title: '3D 交互式作品集',
      description: '使用 Three.js 和 React Three Fiber 打造的沉浸式 3D 作品展示平台',
      tags: ['React', 'Three.js', 'TypeScript', 'Framer Motion'],
      image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop',
      github: 'https://github.com',
      demo: 'https://example.com',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: '实时协作平台',
      description: '基于 WebSocket 的实时协作工具，支持多人同时编辑和实时同步',
      tags: ['React', 'Node.js', 'WebSocket', 'MongoDB'],
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      github: 'https://github.com',
      demo: 'https://example.com',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'AI 图像生成器',
      description: '集成 AI 模型的创意图像生成工具，支持多种艺术风格和自定义参数',
      tags: ['React', 'Python', 'AI/ML', 'FastAPI'],
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
      github: 'https://github.com',
      demo: 'https://example.com',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: '数据可视化仪表板',
      description: '强大的数据分析和可视化平台，支持多种图表类型和实时数据更新',
      tags: ['React', 'D3.js', 'TypeScript', 'Chart.js'],
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      github: 'https://github.com',
      demo: 'https://example.com',
      color: 'from-blue-500 to-cyan-500',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -15 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  return (
    <section
      id="projects"
      ref={ref}
      className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* 标题 */}
          <motion.div
            variants={cardVariants}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">精选项目</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              探索我的最新作品，每一个项目都是创意与技术的完美结合
            </p>
          </motion.div>

          {/* 项目网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project) => (
              <motion.div
                key={project.title}
                variants={cardVariants}
                className="group relative"
                style={{ perspective: '1000px' }}
              >
                <motion.div
                  className="h-full rounded-2xl overflow-hidden glass hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300"
                  whileHover={{ y: -10 }}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* 项目图片 */}
                  <div className="relative h-64 overflow-hidden">
                    <motion.img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                    />
                  </div>

                  {/* 项目内容 */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {project.description}
                    </p>

                    {/* 标签 */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* 链接按钮 */}
                    <div className="flex gap-4">
                      {project.github && (
                        <MagneticButton>
                          <motion.a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg glass hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 text-gray-900 dark:text-white"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Github className="w-5 h-5" />
                            <span>代码</span>
                          </motion.a>
                        </MagneticButton>
                      )}
                      {project.demo && (
                        <MagneticButton>
                          <motion.a
                            href={project.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${project.color} text-white shadow-lg hover:shadow-xl transition-all duration-300`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <ExternalLink className="w-5 h-5" />
                            <span>演示</span>
                          </motion.a>
                        </MagneticButton>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ProjectsSection
