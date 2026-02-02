// API Client
export { apiClient, apiGet, apiPost, apiPut, apiDelete, ApiRequestError, AUTH_ERROR_EVENT } from './client';
export type { ApiResponse } from './client';

// Error Handling
export {
  parseApiError,
  isNetworkError,
  isAuthError,
  isServerError,
  getErrorMessage,
} from './errors';
export type { ParsedApiError } from './errors';

// Types
export type {
  Profile,
  Experience,
  SocialLinks,
  Project,
  ProjectsResponse,
  BlogPost,
  BlogPostsResponse,
  ContactFormData,
  ContactMessage,
  LoginCredentials,
  AuthUser,
  LoginResponse,
  UploadResponse,
  NewsletterSubscription,
} from './types';

// Hooks
export * from './hooks';
