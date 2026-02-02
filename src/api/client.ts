import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { parseApiError } from './errors';

// API base URL - defaults to empty string for production (uses relative paths)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? 'http://localhost:3000' : '');

/**
 * Custom event for auth errors - allows components to react to auth failures
 */
export const AUTH_ERROR_EVENT = 'auth:error';

/**
 * Dispatch auth error event for global handling
 */
function dispatchAuthError(): void {
  window.dispatchEvent(new CustomEvent(AUTH_ERROR_EVENT, {
    detail: { message: '登录已过期，请重新登录' }
  }));
}

/**
 * Get the API base URL for direct fetch calls
 */
export function getApiBaseUrl(): string {
  return `${API_BASE_URL}/api`;
}

/**
 * Axios instance configured for the portfolio API
 * 
 * Validates: Requirement 1.5 - Graceful error handling
 * Validates: Requirement 8.4 - Appropriate error information
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add auth token and log requests
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      const method = config.method?.toUpperCase() || 'GET';
      const url = config.url || '';
      console.log(`%c${method}%c ${url}`, 'color: #0ea5e9; font-weight: bold', 'color: #666');
      if (config.data) {
        console.log('  Payload:', config.data);
      }
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling and logging
 * Provides centralized error handling for all API requests
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      const method = response.config.method?.toUpperCase() || 'GET';
      const status = response.status;
      const statusColor = status >= 200 && status < 300 ? '#10b981' : '#f59e0b';
      console.log(`%c${method}%c ${response.config.url} %c${status}`, 'color: #0ea5e9; font-weight: bold', 'color: #666', `color: ${statusColor}; font-weight: bold`);
    }
    return response;
  },
  (error: AxiosError) => {
    // Log error response in development
    if (import.meta.env.DEV) {
      const method = error.config?.method?.toUpperCase() || 'GET';
      const status = error.response?.status || 'ERR';
      const statusColor = '#ef4444';
      console.log(`%c${method}%c ${error.config?.url} %c${status}`, 'color: #0ea5e9; font-weight: bold', 'color: #666', `color: ${statusColor}; font-weight: bold`);
      if (error.response?.data) {
        console.log('  Error:', error.response.data);
      }
    }

    // Log error for debugging (only in development)
    if (import.meta.env.DEV) {
      const parsed = parseApiError(error);
      console.error(`API Error [${parsed.code || 'UNKNOWN'}]:`, parsed.message);
    }

    // Handle 401 Unauthorized - clear token and dispatch event
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      dispatchAuthError();
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.warn('Access forbidden - insufficient permissions');
    }

    return Promise.reject(error);
  }
);

/**
 * Standard API response format
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
    timestamp: string;
  };
}

/**
 * API Error class for typed error handling
 */
export class ApiRequestError extends Error {
  public code: string;
  public statusCode?: number;
  public details?: unknown;

  constructor(message: string, code: string, statusCode?: number, details?: unknown) {
    super(message);
    this.name = 'ApiRequestError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Generic GET request with improved error handling
 */
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.get<ApiResponse<T>>(url, config);
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    const error = response.data.error;
    throw new ApiRequestError(
      error?.message || 'Request failed',
      error?.code || 'UNKNOWN_ERROR',
      undefined,
      error?.details
    );
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }
    const parsed = parseApiError(error);
    throw new ApiRequestError(parsed.message, parsed.code || 'UNKNOWN_ERROR', parsed.statusCode, parsed.details);
  }
}

/**
 * Generic POST request with improved error handling
 */
export async function apiPost<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.post<ApiResponse<T>>(url, data, config);
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    const error = response.data.error;
    throw new ApiRequestError(
      error?.message || 'Request failed',
      error?.code || 'UNKNOWN_ERROR',
      undefined,
      error?.details
    );
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }
    const parsed = parseApiError(error);
    throw new ApiRequestError(parsed.message, parsed.code || 'UNKNOWN_ERROR', parsed.statusCode, parsed.details);
  }
}

/**
 * Generic PUT request with improved error handling
 */
export async function apiPut<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.put<ApiResponse<T>>(url, data, config);
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    const error = response.data.error;
    throw new ApiRequestError(
      error?.message || 'Request failed',
      error?.code || 'UNKNOWN_ERROR',
      undefined,
      error?.details
    );
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }
    const parsed = parseApiError(error);
    throw new ApiRequestError(parsed.message, parsed.code || 'UNKNOWN_ERROR', parsed.statusCode, parsed.details);
  }
}

/**
 * Generic PATCH request with improved error handling
 */
export async function apiPatch<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    const error = response.data.error;
    throw new ApiRequestError(
      error?.message || 'Request failed',
      error?.code || 'UNKNOWN_ERROR',
      undefined,
      error?.details
    );
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }
    const parsed = parseApiError(error);
    throw new ApiRequestError(parsed.message, parsed.code || 'UNKNOWN_ERROR', parsed.statusCode, parsed.details);
  }
}

/**
 * Generic DELETE request with improved error handling
 */
export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.delete<ApiResponse<T>>(url, config);
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    const error = response.data.error;
    throw new ApiRequestError(
      error?.message || 'Request failed',
      error?.code || 'UNKNOWN_ERROR',
      undefined,
      error?.details
    );
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }
    const parsed = parseApiError(error);
    throw new ApiRequestError(parsed.message, parsed.code || 'UNKNOWN_ERROR', parsed.statusCode, parsed.details);
  }
}

export default apiClient;
