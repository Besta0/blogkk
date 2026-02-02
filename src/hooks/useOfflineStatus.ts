import { useState, useEffect, useCallback } from 'react'

interface OfflineStatus {
  isOnline: boolean
  isServiceWorkerReady: boolean
  hasUpdate: boolean
  updateServiceWorker: () => void
}

/**
 * Custom hook for managing offline status and service worker updates
 * 
 * Validates: Requirement 9.5 - Offline browsing functionality
 */
export function useOfflineStatus(): OfflineStatus {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false)
  const [hasUpdate, setHasUpdate] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setIsServiceWorkerReady(true)
        setRegistration(reg)

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setHasUpdate(true)
              }
            })
          }
        })
      })
    }
  }, [])

  const updateServiceWorker = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }, [registration])

  return {
    isOnline,
    isServiceWorkerReady,
    hasUpdate,
    updateServiceWorker,
  }
}

export default useOfflineStatus
