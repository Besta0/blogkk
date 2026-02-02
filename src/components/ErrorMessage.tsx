import { memo } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, RefreshCw, WifiOff, ServerCrash, ShieldAlert, Clock } from 'lucide-react'

export type ErrorType = 'network' | 'server' | 'auth' | 'timeout' | 'unknown'

interface ErrorMessageProps {
  title?: string
  message: string
  type?: ErrorType
  onRetry?: () => void
  className?: string
  compact?: boolean
}

/**
 * Get error icon based on error type
 */
const getErrorIcon = (type: ErrorType) => {
  switch (type) {
    case 'network':
      return WifiOff
    case 'server':
      return ServerCrash
    case 'auth':
      return ShieldAlert
    case 'timeout':
      return Clock
    default:
      return AlertCircle
  }
}

/**
 * Get default title based on error type
 */
const getDefaultTitle = (type: ErrorType): string => {
  switch (type) {
    case 'network':
      return '网络连接失败'
    case 'server':
      return '服务器错误'
    case 'auth':
      return '认证失败'
    case 'timeout':
      return '请求超时'
    default:
      return '出错了'
  }
}

/**
 * Reusable error message component for displaying API and other errors.
 * Provides user-friendly error messages with retry functionality.
 * 
 * Validates: Requirement 1.5 - User-friendly error messages
 * Validates: Requirement 8.4 - Appropriate error information display
 */
const ErrorMessage = memo(function ErrorMessage({
  title,
  message,
  type = 'unknown',
  onRetry,
  className = '',
  compact = false,
}: ErrorMessageProps) {
  const Icon = getErrorIcon(type)
  const displayTitle = title || getDefaultTitle(type)

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 ${className}`}
      >
        <Icon className="w-5 h-5 text-red-500 flex-shrink-0" />
        <p className="text-sm text-red-700 dark:text-red-400 flex-1">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            重试
          </button>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`text-center glass rounded-2xl p-8 max-w-md mx-auto ${className}`}
    >
      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
        <Icon className="w-7 h-7 text-amber-500" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {displayTitle}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {message}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold hover:opacity-90 transition-opacity"
        >
          <RefreshCw className="w-4 h-4" />
          重试
        </button>
      )}
    </motion.div>
  )
})

export default ErrorMessage
