import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Github, Mail, Linkedin, Twitter, Globe, Terminal } from 'lucide-react'
import MagneticButton from './MagneticButton'
import { useEffect, useMemo, useState } from 'react'
import { useProfile } from '../api/hooks/useProfile'

// Loading skeleton component
const HeroSkeleton = () => (
  <section id="home" className="min-h-screen relative overflow-hidden pt-20">
    <div className="absolute inset-0 bg-white dark:bg-gray-950" />
    <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_20%,rgba(14,165,233,0.14),transparent_60%),radial-gradient(900px_circle_at_80%_30%,rgba(217,70,239,0.10),transparent_60%)] animate-gradient [background-size:200%_200%]" />
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:28px_28px]" />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-gray-950" />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="min-h-[calc(100vh-5rem)] grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-full" />
          <div className="mt-6 h-16 w-3/4 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          <div className="mt-4 h-16 w-1/2 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          <div className="mt-6 h-6 w-full max-w-2xl bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="mt-2 h-6 w-3/4 max-w-2xl bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="mt-8 flex gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-8 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-5 animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
)

const HeroSection = () => {
  const profileQuery = useProfile()
  
  // Debug logging
  console.log('Profile query result:', profileQuery)
  
  if (!profileQuery) {
    console.error('useProfile returned undefined - React Query not properly initialized')
    return <div>Error: React Query not initialized</div>
  }
  
  const { data: profile, isLoading } = profileQuery

  // Use API data - show loading if no data
  const profileData = profile

  const roles = useMemo(
    () => ['Full-stack Developer', 'System Builder', 'UX-minded Engineer', 'Performance Optimizer'],
    [],
  )
  const [roleIndex, setRoleIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setRoleIndex((i) => (i + 1) % roles.length)
    }, 2200)
    return () => window.clearInterval(id)
  }, [roles.length])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  const scrollToNext = () => {
    const aboutSection = document.querySelector('#about')
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Build social links array from profile data
  const socialLinks = useMemo(() => {
    const links: { icon: typeof Github; href: string; label: string }[] = []
    const social = profileData?.social

    if (social?.github) {
      links.push({ icon: Github, href: social.github, label: 'GitHub' })
    }
    if (social?.linkedin) {
      links.push({ icon: Linkedin, href: social.linkedin, label: 'LinkedIn' })
    }
    if (social?.twitter) {
      links.push({ icon: Twitter, href: social.twitter, label: 'Twitter' })
    }
    if (social?.email) {
      links.push({ icon: Mail, href: `mailto:${social.email}`, label: 'Email' })
    }
    if (social?.website) {
      links.push({ icon: Globe, href: social.website, label: 'Website' })
    }

    return links
  }, [profileData?.social])

  // Show loading skeleton
  if (isLoading || !profileData) {
    return <HeroSkeleton />
  }

  return (
    <section id="home" className="min-h-screen relative overflow-hidden pt-20">
      {/* 极简科技背景：克制渐变 + 网格 */}
      <div className="absolute inset-0 bg-white dark:bg-gray-950" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_20%,rgba(14,165,233,0.14),transparent_60%),radial-gradient(900px_circle_at_80%_30%,rgba(217,70,239,0.10),transparent_60%)] animate-gradient [background-size:200%_200%]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:28px_28px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-gray-950" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        <div className="min-h-[calc(100vh-5rem)] grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: copy */}
          <div className="lg:col-span-7">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Available for interesting work</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="mt-6 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="text-gray-900 dark:text-white">{profileData.name}</span>
              <br />
              <span className="text-gradient">{profileData.title}</span>
            </motion.h1>

            <motion.div variants={itemVariants} className="mt-5 h-8">
              <AnimatePresence mode="wait">
                <motion.p
                  key={roles[roleIndex]}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="text-lg md:text-xl text-gray-600 dark:text-gray-400"
                >
                  {roles[roleIndex]}
                </motion.p>
              </AnimatePresence>
            </motion.div>

            <motion.p variants={itemVariants} className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
              {profileData.bio}
            </motion.p>

            <motion.div variants={itemVariants} className="mt-8 flex flex-wrap gap-3">
              {profileData.skills.slice(0, 8).map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-full text-sm glass text-gray-800 dark:text-gray-200"
                >
                  {skill}
                </span>
              ))}
            </motion.div>

            <motion.div variants={itemVariants} className="mt-10 flex flex-wrap gap-4">
              <MagneticButton>
                <motion.a
                  href="#projects"
                  onClick={(e) => {
                    e.preventDefault()
                    document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="inline-block px-7 py-3.5 rounded-xl font-semibold shadow-lg transition-all duration-300"
                  style={{ backgroundColor: '#1f2937', color: '#ffffff' }}
                  whileHover={{ scale: 1.03, backgroundColor: '#374151' }}
                  whileTap={{ scale: 0.98 }}
                >
                  View Projects
                </motion.a>
              </MagneticButton>

              <MagneticButton>
                <motion.a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault()
                    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="inline-block px-7 py-3.5 rounded-xl font-semibold shadow-lg transition-all duration-300"
                  style={{ backgroundColor: '#1f2937', color: '#ffffff' }}
                  whileHover={{ scale: 1.03, backgroundColor: '#374151' }}
                  whileTap={{ scale: 0.98 }}
                >
                  Contact Me
                </motion.a>
              </MagneticButton>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-10 flex items-center gap-5">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith('http') ? '_blank' : undefined}
                  rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="p-3 rounded-xl glass hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Right: terminal card */}
          <div className="lg:col-span-5">
            <motion.div variants={itemVariants} className="glass rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Terminal className="w-4 h-4" />
                  <span>~/portfolio</span>
                </div>
              </div>

              <div className="p-5 font-mono text-sm leading-6 text-gray-800 dark:text-gray-200">
                <div className="text-gray-500 dark:text-gray-400">$ whoami</div>
                <div className="mt-1">
                  <span className="text-emerald-500">full-stack</span> engineer · shipping practical products
                </div>

                <div className="mt-4 text-gray-500 dark:text-gray-400">$ stack</div>
                <div className="mt-1">
                  <div>frontend: React · TypeScript · Tailwind</div>
                  <div>backend: Node.js · API · DB</div>
                  <div>ops: Docker · Nginx · CI/CD</div>
                </div>

                <div className="mt-4 text-gray-500 dark:text-gray-400">$ now</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                  building something clean and fast
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-6 grid grid-cols-3 gap-3">
              {[
                { k: 'Projects', v: '12+' },
                { k: 'Years', v: '3+' },
                { k: 'Focus', v: 'DX/Perf' },
              ].map((s) => (
                <div key={s.k} className="glass rounded-xl p-4">
                  <div className="text-xs text-gray-600 dark:text-gray-400">{s.k}</div>
                  <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{s.v}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.button
            onClick={scrollToNext}
            className="p-2 rounded-xl glass hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            whileHover={{ scale: 1.08 }}
            aria-label="Scroll"
          >
            <ChevronDown className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default HeroSection
