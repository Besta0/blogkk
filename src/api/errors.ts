import { AxiosError } from 'axios'
import type { ErrorType } from '../components/ErrorMessage'

/**
 * Parsed API error with user-friendly message
 */
export interface ParsedApiError {
  type: ErrorType
  message: string
  code?: string
  statusCode?: number
  details?: unknown
}

/**
 * API error response format from backend
 */
interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
    timestamp: string
  }
}

/**
 * Parse an error into a user-friendly format.
 * Handles Axios errors, API errors, and generic errors.
 * 
 * Validates: Requirement 1.5 - User-friendly error messages
 * Validates: Requirement 8.4 - Appropriate error information
 */
export function parseApiError(error: unknown): ParsedApiError {
  // Handle Axios errors
  if (isAxiosError(error)) {
    return parseAxiosError(error)
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      type: 'unknown',
      message: error.message || '发生了未知错误',
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      type: 'unknown',
      message: error,
    }
  }

  // Fallback for unknown error types
  return {
    type: 'unknown',
    message: '发生了未知错误，请稍后重试',
  }
}

/**
 * Type guard for Axios errors
 */
function isAxiosError(error: unknown): error is AxiosError<ApiErrorResponse | unknown> {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  )
}

/**
 * Parse Axios error into user-friendly format
 */
function parseAxiosError(error: AxiosError<ApiErrorResponse | unknown>): ParsedApiError {
  // Network error (no response)
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return {
        type: 'timeout',
        message: '请求超时，请检查网络连接后重试',
        code: 'TIMEOUT',
      }
    }
    return {
      type: 'network',
      message: '网络连接失败，请检查网络设置后重试',
      code: 'NETWORK_ERROR',
    }
  }

  const { status, data } = error.response
  const apiError = (data as ApiErrorResponse | undefined)?.error

  // Use API error message if available
  const message = apiError?.message || getDefaultErrorMessage(status)
  const code = apiError?.code || getDefaultErrorCode(status)

  return {
    type: getErrorType(status),
    message,
    code,
    statusCode: status,
    details: apiError?.details,
  }
}

/**
 * Get error type based on HTTP status code
 */
function getErrorType(status: number): ErrorType {
  if (status === 401 || status === 403) {
    return 'auth'
  }
  if (status >= 500) {
    return 'server'
  }
  if (status === 408) {
    return 'timeout'
  }
  return 'unknown'
}

/**
 * Get default error message based on HTTP status code
 */
function getDefaultErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: '请求参数有误，请检查后重试',
    401: '登录已过期，请重新登录',
    403: '没有权限执行此操作',
    404: '请求的资源不存在',
    408: '请求超时，请稍后重试',
    409: '数据冲突，请刷新后重试',
    422: '提交的数据验证失败',
    429: '请求过于频繁，请稍后重试',
    500: '服务器内部错误，请稍后重试',
    502: '服务暂时不可用，请稍后重试',
    503: '服务正在维护中，请稍后重试',
    504: '服务器响应超时，请稍后重试',
  }
  return messages[status] || '发生了未知错误，请稍后重试'
}

/**
 * Get default error code based on HTTP status code
 */
function getDefaultErrorCode(status: number): string {
  const codes: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    408: 'TIMEOUT',
    409: 'CONFLICT',
    422: 'VALIDATION_ERROR',
    429: 'TOO_MANY_REQUESTS',
    500: 'INTERNAL_SERVER_ERROR',
    502: 'BAD_GATEWAY',
    503: 'SERVICE_UNAVAILABLE',
    504: 'GATEWAY_TIMEOUT',
  }
  return codes[status] || 'UNKNOWN_ERROR'
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  const parsed = parseApiError(error)
  return parsed.type === 'network'
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  const parsed = parseApiError(error)
  return parsed.type === 'auth'
}

/**
 * Check if error is a server error
 */
export function isServerError(error: unknown): boolean {
  const parsed = parseApiError(error)
  return parsed.type === 'server'
}

/**
 * Get user-friendly error message from any error
 */
export function getErrorMessage(error: unknown): string {
  return parseApiError(error).message
}
