import { motion } from 'framer-motion'
import { useState } from 'react'
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useNewsletterSubscribe } from '../api/hooks/useContact'

type SubscribeStatus = 'idle' | 'success' | 'error'

const NewsletterSubscribe = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<SubscribeStatus>('idle')
  const [message, setMessage] = useState('')

  const subscribe = useNewsletterSubscribe()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('idle')
    setMessage('')

    if (!email.trim()) {
      setStatus('error')
      setMessage('Please enter your email')
      return
    }

    subscribe.mutate(email, {
      onSuccess: (data) => {
        setStatus('success')
        setMessage(data.message || 'Subscribed successfully!')
        setEmail('')
        setTimeout(() => setStatus('idle'), 5000)
      },
      onError: (error: Error) => {
        setStatus('error')
        setMessage(error.message || 'Subscription failed, please try again')
        setTimeout(() => setStatus('idle'), 5000)
      },
    })
  }

  return (
    <motion.div
      className="p-6 rounded-xl glass border border-white/20 dark:border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
          <Mail className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Subscribe for Updates
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get notified about new projects and articles
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg glass border border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
            disabled={subscribe.isPending}
          />
          <motion.button
            type="submit"
            disabled={subscribe.isPending}
            className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium text-sm shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {subscribe.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Subscribe'
            )}
          </motion.button>
        </div>

        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm"
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{message}</span>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm"
          >
            <XCircle className="w-4 h-4 flex-shrink-0" />
            <span>{message}</span>
          </motion.div>
        )}
      </form>

      <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">
        We respect your privacy. Unsubscribe anytime.
      </p>
    </motion.div>
  )
}

export default NewsletterSubscribe
