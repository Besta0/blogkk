import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Code, Palette, Rocket, Zap } from 'lucide-react'

const AboutSection = () => {
  const ref = useRef(null)
  // 每次进入/离开视口都触发（支持反复滚动时重复播放动画）
  const isInView = useInView(ref, { once: false, margin: '-100px' })

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

  const skills = [
    { name: 'React', level: 90, color: 'from-blue-500 to-cyan-500' },
    { name: 'TypeScript', level: 85, color: 'from-blue-600 to-blue-400' },
    { name: 'Node.js', level: 80, color: 'from-green-500 to-emerald-500' },
    { name: 'UI/UX Design', level: 75, color: 'from-purple-500 to-pink-500' },
    { name: 'Three.js', level: 70, color: 'from-orange-500 to-red-500' },
    { name: 'Framer Motion', level: 85, color: 'from-pink-500 to-rose-500' },
  ]

  const timeline = [
    {
      year: '2024',
      title: '高级前端工程师',
      description: '专注于创建交互式 Web 体验和性能优化',
    },
    {
      year: '2022',
      title: '全栈开发者',
      description: '开始探索 3D Web 开发和创意编程',
    },
    {
      year: '2020',
      title: '前端开发者',
      description: '开始前端开发之旅，专注于 React 生态系统',
    },
  ]

  const features = [
    { icon: Code, title: '代码质量', description: '编写清晰、可维护的代码' },
    { icon: Palette, title: '设计思维', description: '注重用户体验和视觉设计' },
    { icon: Rocket, title: '性能优化', description: '追求极致的加载速度和流畅度' },
    { icon: Zap, title: '创新精神', description: '不断探索新技术和创意方案' },
  ]

  return (
    <section
      id="about"
      ref={ref}
      className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* 标题 */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">关于我</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              热爱创造，专注于打造令人惊艳的数字体验
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
                animate={isInView ? { opacity: 1, y: 0 } : {}}
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

          {/* 技能 */}
          <motion.div variants={itemVariants} className="mb-20">
            <h3 className="text-3xl font-bold mb-8 text-center">技能</h3>
            <div className="space-y-4">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  className="group"
                  initial={{ opacity: 0, x: -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
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
                      animate={isInView ? { width: `${skill.level}%` } : { width: 0 }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 时间线 */}
          <motion.div variants={itemVariants}>
            <h3 className="text-3xl font-bold mb-8 text-center">经历</h3>
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
                      isInView
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
