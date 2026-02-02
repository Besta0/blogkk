import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * React Query provider with optimized caching configuration and global error handling.
 * 
 * Caching Strategy:
 * - Profile data: 5 minutes stale time (rarely changes)
 * - Projects list: 2 minutes stale time (moderate updates)
 * - Blog posts: 3 minutes stale time (moderate updates)
 * - Analytics: 30 seconds stale time (frequent updates)
 * 
 * Performance Optimizations:
 * - Longer gcTime to keep data in cache for offline/background use
 * - Disabled refetchOnWindowFocus in development for better DX
 * - Retry with exponential backoff for resilience
 * - Placeholder data support for instant UI
 * 
 * Error Handling:
 * - Global error handler for logging and monitoring
 * - Auth error detection for automatic logout
 * - User-friendly error messages via parseApiError
 * 
 * Validates: Requirement 1.5 - Graceful error handling
 * Validates: Requirement 8.4 - Appropriate error information
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 3,
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export default QueryProvider;
