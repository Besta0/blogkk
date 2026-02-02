import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { Code, Palette, Rocket, Zap } from 'lucide-react'
import { useProfile } from '../api/hooks/useProfile'
import type { Experience } from '../api/types'

// Skill color palette for dynamic assignment
const SKILL_COLORS = [
  'from-blue-500 to-cyan-500',
  'from-blue-600 to-blue-400',
  'from-green-500 to-emerald-500',
  'from-purple-500 to-pink-500',
  'from-orange-500 to-red-500',
  'from-pink-500 to-rose-500',
  'from-indigo-500 to-purple-500',
  'from-teal-500 to-green-500',
]

// Loading skeleton component
const AboutSkeleton = () => (
  <section
    id="about"
    className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 relative overflow-hidden"
  >
    <div className="max-w-7xl mx-auto animate-pulse">
      {/* Title skeleton */}
      <div className="text-center mb-16">
        <div className="h-12 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto mb-4" />
        <div className="h-6 w-96 max-w-full bg-gray-200 dark:bg-gray-800 rounded mx-auto" />
      </div>

      {/* Features skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 rounded-2xl glass">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4" />
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        ))}
      </div>

      {/* Skills skeleton */}
      <div className="mb-20">
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded mx-auto mb-8" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i}>
              <div className="flex justify-between mb-2">
                <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-5 w-12 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Timeline skeleton */}
      <div>
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded mx-auto mb-8" />
        <div className="space-y-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="ml-16 md:ml-0 md:w-5/12">
              <div className="p-6 rounded-2xl glass">
                <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
)

// Helper function to convert Experience to timeline format
const experienceToTimeline = (experience: Experience[]) => {
  return experience
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .map((exp) => ({
      year: new Date(exp.startDate).getFullYear().toString(),
      title: exp.position,
      description: exp.description,
    }))
}

// Helper function to convert skills array to display format with levels and colors
const skillsToDisplay = (skills: string[]) => {
  // Assign decreasing levels starting from 90, with minimum of 60
  return skills.slice(0, 8).map((name, index) => ({
    name,
    level: Math.max(90 - index * 5, 60),
    color: SKILL_COLORS[index % SKILL_COLORS.length],
  }))
}

const AboutSection = () => {
  const { data: profile, isLoading } = useProfile()
  
  // 数据加载完成后始终显示内容
  const shouldShow = !isLoading

  // Transform API data to display format
  const skills = useMemo(() => {
    if (profile?.skills && profile.skills.length > 0) {
      return skillsToDisplay(profile.skills)
    }
    return []
  }, [profile?.skills])

  const timeline = useMemo(() => {
    if (profile?.experience && profile.experience.length > 0) {
      return experienceToTimeline(profile.experience)
    }
    return []
  }, [profile?.experience])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  const features = [
    { icon: Code, title: 'Code Quality', description: 'Writing clean, maintainable code' },
    { icon: Palette, title: 'Design Thinking', description: 'Focus on UX and visual design' },
    { icon: Rocket, title: 'Performance', description: 'Optimizing for speed and smoothness' },
    { icon: Zap, title: 'Innovation', description: 'Exploring new technologies and ideas' },
  ]

  // Show loading skeleton
  if (isLoading) {
    return <AboutSkeleton />
  }

  // Always use default data when there's an error - don't show error page

  return (
    <section
      id="about"
      className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={shouldShow ? 'visible' : 'hidden'}
        >
          {/* Title */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">About Me</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Passionate about creating amazing digital experiences
            </p>
          </motion.div>

          {/* 特性卡片 */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="p-6 rounded-2xl glass hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 group"
                whileHover={{ scale: 1.05, y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={shouldShow ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Skills */}
          <motion.div variants={itemVariants} className="mb-20">
            <h3 className="text-3xl font-bold mb-8 text-center">Skills</h3>
            <div className="space-y-4">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  className="group"
                  initial={{ opacity: 0, x: -50 }}
                  animate={shouldShow ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {skill.name}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">{skill.level}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${skill.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={shouldShow ? { width: `${skill.level}%` } : { width: 0 }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div variants={itemVariants}>
            <h3 className="text-3xl font-bold mb-8 text-center">Experience</h3>
            <div className="relative">
              {/* 时间线 */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 via-accent-500 to-primary-500" />

              <div className="space-y-12">
                {timeline.map((item, index) => (
                  <motion.div
                    key={item.year}
                    className={`relative flex items-center ${
                      index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    animate={
                      shouldShow
                        ? { opacity: 1, x: 0 }
                        : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }
                    }
                    transition={{ delay: index * 0.2 }}
                  >
                    {/* 时间点 */}
                    <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 border-4 border-white dark:border-gray-900 z-10" />

                    {/* 内容卡片 */}
                    <div
                      className={`ml-16 md:ml-0 md:w-5/12 ${
                        index % 2 === 0 ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'
                      }`}
                    >
                      <motion.div
                        className="p-6 rounded-2xl glass hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300"
                        whileHover={{ scale: 1.02, x: index % 2 === 0 ? 10 : -10 }}
                      >
                        <div className="text-primary-500 dark:text-primary-400 font-bold text-lg mb-2">
                          {item.year}
                        </div>
                        <h4 className="text-xl font-semibold mb-2">{item.title}</h4>
                        <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default AboutSection
