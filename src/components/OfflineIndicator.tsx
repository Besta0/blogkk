import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi, RefreshCw } from 'lucide-react'

/**
 * OfflineIndicator Component
 * Displays a notification when the user goes offline and provides
 * visual feedback about network status changes.
 * 
 * Validates: Requirement 9.5 - Offline browsing functionality
 */
export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showReconnected, setShowReconnected] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowReconnected(true)
      // Hide the reconnected message after 3 seconds
      setTimeout(() => setShowReconnected(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowReconnected(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Listen for service worker updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          setIsUpdating(true)
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, show update notification
                setIsUpdating(false)
              }
            })
          }
        })
      })
    }
  }, [])

  const handleRefresh = () => {
    window.location.reload()
  }

  // Don't render anything if online and no special state
  if (isOnline && !showReconnected && !isUpdating) {
    return null
  }

  return (
    <AnimatePresence>
      {/* Offline indicator */}
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-3 shadow-lg"
        >
          <div className="container mx-auto flex items-center justify-center gap-3">
            <WifiOff className="w-5 h-5" />
            <span className="font-medium">
              您当前处于离线状态。部分功能可能不可用。
            </span>
          </div>
        </motion.div>
      )}

      {/* Reconnected indicator */}
      {showReconnected && isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white px-4 py-3 shadow-lg"
        >
          <div className="container mx-auto flex items-center justify-center gap-3">
            <Wifi className="w-5 h-5" />
            <span className="font-medium">
              网络已恢复连接
            </span>
            <button
              onClick={handleRefresh}
              className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-md transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              刷新
            </button>
          </div>
        </motion.div>
      )}

      {/* Update available indicator */}
      {isUpdating && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50 bg-blue-500 text-white px-4 py-3 shadow-lg"
        >
          <div className="container mx-auto flex items-center justify-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="font-medium">
              正在更新应用...
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
