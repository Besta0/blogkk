import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo, memo, useCallback } from 'react'
import { ExternalLink, Github, X, Eye, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import LazyImage from './LazyImage'
import { useProjects, useTechnologies, useLikeProject, useRecordProjectView } from '../api/hooks/useProjects'
import type { Project } from '../api/types'

// Loading skeleton component
const ProjectsSkeleton = memo(function ProjectsSkeleton() {
  return (
    <section
      id="projects"
      className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto animate-pulse">
        <div className="text-center mb-16">
          <div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-4" />
          <div className="h-6 w-96 max-w-full bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
        </div>
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
          ))}
        </div>
      </div>
    </section>
  )
})

// Project detail modal component
interface ProjectModalProps {
  project: Project
  onClose: () => void
  onLike: (id: string) => void
  isLiking: boolean
}

const ProjectModal = memo(function ProjectModal({ project, onClose, onLike, isLiking }: ProjectModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const hasImages = project.images.length > 0
  const images = project.images

  const nextImage = useCallback(() => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }, [hasImages, images.length])

  const prevImage = useCallback(() => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }, [hasImages, images.length])

  const handleLike = useCallback(() => {
    onLike(project.id)
  }, [onLike, project.id])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <div className="relative h-64 md:h-96 overflow-hidden bg-gray-100 dark:bg-gray-800">
          {hasImages ? (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  className="w-full h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <LazyImage
                    src={images[currentImageIndex]}
                    alt={`${project.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500 text-lg">No Image</span>
            </div>
          )}
        </div>

        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {project.title}
            </h2>
            <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {project.views}
              </span>
              <button
                onClick={handleLike}
                disabled={isLiking}
                className="flex items-center gap-1 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                <Heart className={`w-4 h-4 ${isLiking ? 'animate-pulse' : ''}`} />
                {project.likes}
              </button>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
            {project.description}
          </p>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-gray-800 text-white hover:opacity-90 transition-opacity"
              >
                <Github className="w-5 h-5" />
                View Code
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90 transition-opacity"
              >
                <ExternalLink className="w-5 h-5" />
                Live Demo
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
})

const ProjectsSection = () => {
  const [selectedTechnology, setSelectedTechnology] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // Fetch all projects without pagination
  const projectsQuery = useProjects({
    limit: 100, // Get all projects
    technology: selectedTechnology || undefined,
  })

  if (!projectsQuery) {
    console.error('useProjects returned undefined')
    return <div>Error: React Query not initialized</div>
  }

  const { data: projectsData, isLoading } = projectsQuery

  // Fetch technologies for filtering
  const technologiesQuery = useTechnologies()
  
  if (!technologiesQuery) {
    console.error('useTechnologies returned undefined')
    return <div>Error: React Query not initialized</div>
  }
  
  const { data: technologiesData } = technologiesQuery

  // Like mutation
  const likeMutation = useLikeProject()

  // View recording mutation
  const recordViewMutation = useRecordProjectView()

  // Handle opening project modal and recording view
  const handleOpenProject = useCallback((project: Project) => {
    setSelectedProject(project)
    recordViewMutation.mutate(project.id)
  }, [recordViewMutation])

  // Use API data
  const projects = useMemo(() => {
    return projectsData?.projects || []
  }, [projectsData?.projects])

  // Get unique technologies for filter
  const technologies = useMemo(() => {
    return technologiesData?.technologies || []
  }, [technologiesData?.technologies])

  const handleLike = useCallback((id: string) => {
    likeMutation.mutate(id)
  }, [likeMutation])

  const handleTechnologyClick = useCallback((tech: string | null) => {
    setSelectedTechnology(tech)
  }, [])

  if (isLoading) {
    return <ProjectsSkeleton />
  }

  return (
    <>
      <section
        id="projects"
        className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* 标题 */}
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                <span className="text-gradient">Featured Projects</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-base max-w-2xl mx-auto">
                Explore my latest work, where creativity meets technology
              </p>
            </div>

            {/* 技术筛选 */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <button
                onClick={() => handleTechnologyClick(null)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedTechnology === null
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'glass hover:bg-white/20 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'
                }`}
              >
                All
              </button>
              {technologies.slice(0, 8).map((tech) => (
                <button
                  key={tech}
                  onClick={() => handleTechnologyClick(tech)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedTechnology === tech
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'glass hover:bg-white/20 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>

            {/* 项目循环滚动展示 */}
            <div className="relative mb-8 overflow-hidden py-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedTechnology || 'all'}
                  className="flex gap-6"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    x: [0, -(306 * projects.length)],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    opacity: { duration: 0.3 },
                    x: {
                      repeat: Infinity,
                      repeatType: "loop",
                      duration: projects.length * 3,
                      ease: "linear",
                    },
                  }}
                >
                  {/* 渲染两次项目列表以实现无缝循环 */}
                  {[...projects, ...projects].map((project, index) => (
                    <motion.div
                      key={`${project.id}-${index}`}
                      className="group relative flex-shrink-0 w-[300px]"
                      whileHover={{ scale: 1.05, zIndex: 10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        className="h-full rounded-xl overflow-hidden bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl"
                        onClick={() => handleOpenProject(project)}
                      >
                        {/* 项目图片 */}
                        <div className="relative h-40 overflow-hidden bg-gray-100 dark:bg-gray-700">
                          {project.images[0] ? (
                            <LazyImage
                              src={project.images[0]}
                              alt={project.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-gray-400 dark:text-gray-500 text-sm">No Image</span>
                            </div>
                          )}
                          {/* Stats overlay */}
                          <div className="absolute top-2 right-2 flex gap-1.5">
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs">
                              <Eye className="w-3 h-3" />
                              {project.views}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleLike(project.id)
                              }}
                              disabled={likeMutation.isPending}
                              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs hover:bg-red-500/70 transition-colors disabled:opacity-50"
                              aria-label={`Like project ${project.title}`}
                            >
                              <Heart className={`w-3 h-3 ${likeMutation.isPending ? 'animate-pulse' : ''}`} />
                              {project.likes}
                            </button>
                          </div>

                          {/* Featured badge */}
                          {project.featured && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium">
                              Featured
                            </span>
                          )}
                        </div>

                        {/* 项目内容 */}
                        <div className="p-4">
                          <h3 className="text-lg font-bold mb-1.5 text-gray-900 dark:text-white line-clamp-1">
                            {project.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-2.5 line-clamp-2 text-xs">
                            {project.description}
                          </p>

                          {/* 标签 */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {project.technologies.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 rounded-full text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                              >
                                {tag}
                              </span>
                            ))}
                            {project.technologies.length > 3 && (
                              <span className="px-1.5 py-0.5 rounded-full text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                +{project.technologies.length - 3}
                              </span>
                            )}
                          </div>

                          {/* 链接按钮 */}
                          <div className="flex gap-1.5">
                            {project.githubUrl && (
                              <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg glass hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 text-gray-900 dark:text-white text-xs"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Github className="w-3.5 h-3.5" />
                                <span>Code</span>
                              </a>
                            )}
                            {project.liveUrl && (
                              <a
                                href={project.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Demo</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
              
              {/* 渐变遮罩 */}
              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-gray-50 dark:from-gray-800 to-transparent pointer-events-none z-10" />
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-50 dark:from-gray-800 to-transparent pointer-events-none z-10" />
            </div>

            {/* Empty state */}
            {projects.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No matching projects found
                </p>
                <button
                  onClick={() => handleTechnologyClick(null)}
                  className="mt-4 px-6 py-2 rounded-full glass hover:bg-white/20 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-all duration-300"
                >
                  View All Projects
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Project detail modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onLike={handleLike}
            isLiking={likeMutation.isPending}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default ProjectsSection
