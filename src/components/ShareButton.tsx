import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Twitter, Facebook, Linkedin, Link, Check } from 'lucide-react'

export type SharePlatform = 'twitter' | 'facebook' | 'linkedin' | 'copy'

export interface ShareData {
  title: string
  description: string
  url: string
}

interface ShareButtonProps {
  shareData: ShareData
  onShare?: (platform: SharePlatform) => void
  className?: string
  showCount?: boolean
  count?: number
}

/**
 * Generate social media share URLs
 */
export function generateShareUrl(platform: SharePlatform, data: ShareData): string {
  const encodedUrl = encodeURIComponent(data.url)
  const encodedTitle = encodeURIComponent(data.title)
  const encodedDescription = encodeURIComponent(data.description)

  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`
    case 'copy':
      return data.url
    default:
      return data.url
  }
}

const ShareButton = ({ shareData, onShare, className = '', showCount = false, count = 0 }: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleShare = async (platform: SharePlatform) => {
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(shareData.url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = shareData.url
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } else {
      const url = generateShareUrl(platform, shareData)
      window.open(url, '_blank', 'width=600,height=400,noopener,noreferrer')
    }

    onShare?.(platform)
    setIsOpen(false)
  }

  const platforms = [
    { id: 'twitter' as SharePlatform, icon: Twitter, label: 'Twitter', color: 'hover:bg-sky-500/20 hover:text-sky-500' },
    { id: 'facebook' as SharePlatform, icon: Facebook, label: 'Facebook', color: 'hover:bg-blue-600/20 hover:text-blue-600' },
    { id: 'linkedin' as SharePlatform, icon: Linkedin, label: 'LinkedIn', color: 'hover:bg-blue-700/20 hover:text-blue-700' },
    { id: 'copy' as SharePlatform, icon: copied ? Check : Link, label: copied ? '已复制!' : '复制链接', color: copied ? 'bg-green-500/20 text-green-500' : 'hover:bg-gray-500/20 hover:text-gray-500' },
  ]

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 text-white text-xs hover:bg-blue-500/70 transition-colors"
        aria-label="分享项目"
        aria-expanded={isOpen}
      >
        <Share2 className="w-3 h-3" />
        {showCount && <span>{count}</span>}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[140px]"
          >
            <div className="py-1">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => handleShare(platform.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 transition-colors ${platform.color}`}
                >
                  <platform.icon className="w-4 h-4" />
                  <span>{platform.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ShareButton
