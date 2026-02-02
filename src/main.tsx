import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import { QueryProvider } from './providers'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import './index.css'

/**
 * Register Service Worker for offline support
 * Validates: Requirement 9.5 - Offline browsing functionality
 */
const updateSW = registerSW({
  onNeedRefresh() {
    // New content is available, prompt user to refresh
    if (confirm('新版本可用，是否刷新页面？')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('应用已准备好离线使用')
  },
  onRegistered(registration) {
    if (registration) {
      // Check for updates periodically (every hour)
      setInterval(() => {
        registration.update()
      }, 60 * 60 * 1000)
    }
  },
  onRegisterError(error) {
    console.error('Service Worker 注册失败:', error)
  },
})

/**
 * Global error handler for uncaught errors
 * Validates: Requirement 1.5 - Graceful error handling
 */
const handleGlobalError = (error: Error, errorInfo: React.ErrorInfo) => {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('Global error caught:', error, errorInfo)
  }
  
  // In production, you could send this to an error tracking service
  // e.g., Sentry, LogRocket, etc.
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary onError={handleGlobalError}>
    <QueryProvider>
      <App />
    </QueryProvider>
  </ErrorBoundary>
)
