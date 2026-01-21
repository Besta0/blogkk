import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { Mail, Send, Github, Linkedin, Twitter, MessageCircle } from 'lucide-react'
import MagneticButton from './MagneticButton'

const ContactSection = () => {
  const ref = useRef(null)
  // 每次进入/离开视口都触发（支持反复滚动时重复播放动画）
  const isInView = useInView(ref, { once: false, margin: '-100px' })
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // 这里可以集成实际的邮件服务或 API
    setTimeout(() => {
      setIsSubmitting(false)
      alert('消息已发送！我会尽快回复你。')
      setFormData({ name: '', email: '', message: '' })
    }, 1000)
  }

  const socialLinks = [
    { icon: Github, href: 'https://github.com', label: 'GitHub', color: 'hover:text-gray-900 dark:hover:text-white' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn', color: 'hover:text-blue-600' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter', color: 'hover:text-blue-400' },
    { icon: Mail, href: 'mailto:your@email.com', label: 'Email', color: 'hover:text-red-500' },
  ]

  return (
    <section
      id="contact"
      ref={ref}
      className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 relative overflow-hidden"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* 标题 */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">联系我</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              有项目想法或想要合作？随时联系我，让我们一起创造精彩！
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* 联系表单 */}
            <motion.div variants={itemVariants}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  className="relative"
                >
                  <input
                    type="text"
                    placeholder="你的名字"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-lg glass border border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </motion.div>

                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  className="relative"
                >
                  <input
                    type="email"
                    placeholder="你的邮箱"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-lg glass border border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </motion.div>

                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  className="relative"
                >
                  <textarea
                    placeholder="你的消息"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg glass border border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </motion.div>

                <MagneticButton>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Send className="w-5 h-5" />
                        </motion.div>
                        <span>发送中...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>发送消息</span>
                      </>
                    )}
                  </motion.button>
                </MagneticButton>
              </form>
            </motion.div>

            {/* 社交链接和信息 */}
            <motion.div variants={itemVariants} className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  通过社交媒体联系
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  也可以通过以下方式找到我，期待与你交流！
                </p>
              </div>

              <div className="space-y-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-lg glass hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 group"
                    whileHover={{ scale: 1.05, x: 10 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <social.icon className={`w-6 h-6 text-white ${social.color} transition-colors`} />
                    </div>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {social.label}
                    </span>
                  </motion.a>
                ))}
              </div>

              <motion.div
                className="p-6 rounded-lg glass"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-start gap-4">
                  <MessageCircle className="w-6 h-6 text-primary-500 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      快速响应
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      我通常会在 24 小时内回复所有消息。如果是紧急项目，请通过邮件联系。
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ContactSection
