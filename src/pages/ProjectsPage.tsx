import { useState, useMemo, memo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Github, X, Eye, Heart, ChevronLeft, ChevronRight, ArrowLeft, Layers } from 'lucide-react'
import { useProjects, useTechnologies, useLikeProject, useRecordProjectView } from '../api/hooks/useProjects'
import LazyImage from '../components/LazyImage'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import type { Project } from '../api/types'

// Skeleton card
const ProjectCardSkeleton = () => (
  <div className="rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 animate-pulse">
    <div className="h-52 bg-gray-200 dark:bg-gray-700" />
    <div className="p-5">
      <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
    </div>
  </div>
)

// Project detail modal
interface ProjectModalProps {
  project: Project
  onClose: () => void
  onLike: (id: string) => void
  isLiking: boolean
}

const ProjectModal = memo(function ProjectModal({ project, onClose, onLike, isLiking }: ProjectModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const images = project.images
  const hasImages = images.length > 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Image gallery */}
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
                  transition={{ duration: 0.25 }}
                >
                  <LazyImage
                    src={images[currentImageIndex]}
                    alt={`${project.title} screenshot ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((p) => (p - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((p) => (p + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${i === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
              No images available
            </div>
          )}
        </div>

        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between mb-4 gap-4">
            <div>
              {project.featured && (
                <span className="inline-block mb-2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold">
                  Featured
                </span>
              )}
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {project.title}
              </h2>
            </div>
            <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 flex-shrink-0">
              <span className="flex items-center gap-1 text-sm">
                <Eye className="w-4 h-4" />
                {project.views}
              </span>
              <button
                onClick={() => onLike(project.id)}
                disabled={isLiking}
                className="flex items-center gap-1 text-sm hover:text-red-500 transition-colors disabled:opacity-50"
              >
                <Heart className={`w-4 h-4 ${isLiking ? 'animate-pulse' : ''}`} />
                {project.likes}
              </button>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {project.description}
          </p>

          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-gray-700 text-white hover:opacity-90 transition-opacity font-medium"
              >
                <Github className="w-4 h-4" />
                View Code
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90 transition-opacity font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Live Demo
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
})

// Project card
interface ProjectCardProps {
  project: Project
  onOpen: (project: Project) => void
  onLike: (id: string) => void
  isLiking: boolean
}

const ProjectCard = memo(function ProjectCard({ project, onOpen, onLike, isLiking }: ProjectCardProps) {
  return (
    <motion.div
      className="group cursor-pointer h-full"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      onClick={() => onOpen(project)}
    >
      <div className="h-full rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 flex flex-col shadow-sm hover:shadow-xl">
        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-gray-100 dark:bg-gray-700">
          {project.images[0] ? (
            <motion.div className="w-full h-full" whileHover={{ scale: 1.08 }} transition={{ duration: 0.45 }}>
              <LazyImage
                src={project.images[0]}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              No Image
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-3 right-3 flex gap-1.5">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs">
              <Eye className="w-3 h-3" />
              {project.views}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onLike(project.id) }}
              disabled={isLiking}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs hover:bg-red-500/70 transition-colors disabled:opacity-50"
            >
              <Heart className={`w-3 h-3 ${isLiking ? 'animate-pulse' : ''}`} />
              {project.likes}
            </button>
          </div>
          {project.featured && (
            <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold">
              Featured
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
            {project.title}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
            {project.description}
          </p>

          {/* Tech tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.technologies.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 4 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-500">
                +{project.technologies.length - 4}
              </span>
            )}
          </div>

          {/* Links */}
          <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                Code
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-medium hover:opacity-90 transition-opacity"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Demo
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
})

interface ProjectsPageProps {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const ProjectsPage = ({ theme, toggleTheme }: ProjectsPageProps) => {
  const [selectedTechnology, setSelectedTechnology] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const { data: projectsData, isLoading } = useProjects({
    limit: 100,
    technology: selectedTechnology || undefined,
  })

  const { data: technologiesData } = useTechnologies()
  const likeMutation = useLikeProject()
  const recordViewMutation = useRecordProjectView()

  const projects = useMemo(() => projectsData?.projects || [], [projectsData?.projects])
  const technologies = useMemo(() => technologiesData?.technologies || [], [technologiesData?.technologies])

  const handleOpenProject = useCallback((project: Project) => {
    setSelectedProject(project)
    recordViewMutation.mutate(project.id)
  }, [recordViewMutation])

  const handleLike = useCallback((id: string) => {
    likeMutation.mutate(id)
  }, [likeMutation])

  const handleBackToHome = () => {
    window.history.pushState({}, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  const featuredCount = projects.filter((p) => p.featured).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar theme={theme} toggleTheme={toggleTheme} onHomeClick={handleBackToHome} />

      {/* Page Hero */}
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={handleBackToHome}
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="text-gradient">Projects</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-xl max-w-2xl">
              A showcase of my work — from side projects to production applications.
            </p>
            {!isLoading && (
              <div className="flex gap-6 mt-6 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-500" />
                  <strong className="text-gray-900 dark:text-white">{projects.length}</strong> total projects
                </span>
                {featuredCount > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <strong className="text-gray-900 dark:text-white">{featuredCount}</strong> featured
                  </span>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Tech Filter */}
      <div className="bg-white dark:bg-gray-900 sticky top-16 z-30 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2 items-center">
            <Layers className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <button
              onClick={() => setSelectedTechnology(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedTechnology === null
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              All
            </button>
            {technologies.map((tech) => (
              <button
                key={tech}
                onClick={() => setSelectedTechnology(tech)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedTechnology === tech
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!isLoading && (
          <div className="flex items-center justify-between mb-8 text-sm text-gray-500 dark:text-gray-400">
            <span>
              {projects.length} projects
              {selectedTechnology && (
                <span> using <span className="text-blue-500 font-medium">{selectedTechnology}</span></span>
              )}
            </span>
            {selectedTechnology && (
              <button
                onClick={() => setSelectedTechnology(null)}
                className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <p className="text-gray-400 text-xl mb-4">No projects found</p>
            <button
              onClick={() => setSelectedTechnology(null)}
              className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-medium transition-colors"
            >
              View all projects
            </button>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <AnimatePresence mode="popLayout">
              {projects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                >
                  <ProjectCard
                    project={project}
                    onOpen={handleOpenProject}
                    onLike={handleLike}
                    isLiking={likeMutation.isPending}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      <Footer />

      {/* Project Modal */}
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
    </div>
  )
}

export default ProjectsPage
