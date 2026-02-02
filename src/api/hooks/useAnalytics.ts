import { useQuery, useMutation } from '@tanstack/react-query';
import { apiGet, apiPost } from '../client';
import type {
  PageViewStats,
  ProjectStats,
  RealTimeStats,
  AnalyticsSummary,
  RecentPageViewsResponse,
  UserBehaviorStats,
  InteractionTrend,
} from '../types';

const ANALYTICS_QUERY_KEY = ['analytics'];

interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

/**
 * Hook to fetch page view statistics (admin only)
 */
export function usePageViewStats(params: DateRangeParams = {}) {
  const { startDate, endDate } = params;

  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY, 'stats', { startDate, endDate }],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (startDate) searchParams.set('startDate', startDate);
      if (endDate) searchParams.set('endDate', endDate);
      const query = searchParams.toString();
      return apiGet<PageViewStats>(`/analytics/stats${query ? `?${query}` : ''}`);
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch project statistics (admin only)
 */
export function useProjectStats(projectId?: string) {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY, 'projects', projectId],
    queryFn: () => {
      const query = projectId ? `?projectId=${projectId}` : '';
      return apiGet<ProjectStats[]>(`/analytics/projects${query}`);
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch real-time statistics (admin only)
 */
export function useRealTimeStats() {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY, 'realtime'],
    queryFn: () => apiGet<RealTimeStats>('/analytics/realtime'),
    staleTime: 10 * 1000, // 10 seconds - more frequent updates
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  });
}

/**
 * Hook to fetch analytics summary (admin only)
 */
export function useAnalyticsSummary(params: DateRangeParams = {}) {
  const { startDate, endDate } = params;

  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY, 'summary', { startDate, endDate }],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (startDate) searchParams.set('startDate', startDate);
      if (endDate) searchParams.set('endDate', endDate);
      const query = searchParams.toString();
      return apiGet<AnalyticsSummary>(`/analytics/summary${query ? `?${query}` : ''}`);
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch recent page views (admin only)
 */
export function useRecentPageViews(page = 1, limit = 50) {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY, 'views', { page, limit }],
    queryFn: () =>
      apiGet<RecentPageViewsResponse>(`/analytics/views?page=${page}&limit=${limit}`),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to record a page view (public)
 */
export function useRecordPageView() {
  return useMutation({
    mutationFn: (data: { page: string; sessionId?: string }) =>
      apiPost<{ id: string }>('/analytics/view', data),
  });
}

/**
 * Hook to record a project interaction (public)
 */
export function useRecordInteraction() {
  return useMutation({
    mutationFn: (data: { projectId: string; type: 'view' | 'like' | 'share' }) =>
      apiPost<{ id: string }>('/analytics/interaction', data),
  });
}

/**
 * Hook to fetch user behavior statistics (admin only)
 */
export function useUserBehaviorStats(params: DateRangeParams = {}) {
  const { startDate, endDate } = params;

  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY, 'behavior', { startDate, endDate }],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (startDate) searchParams.set('startDate', startDate);
      if (endDate) searchParams.set('endDate', endDate);
      const query = searchParams.toString();
      return apiGet<UserBehaviorStats>(`/analytics/behavior${query ? `?${query}` : ''}`);
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch interaction trends (admin only)
 */
export function useInteractionTrends(params: DateRangeParams = {}) {
  const { startDate, endDate } = params;

  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY, 'trends', { startDate, endDate }],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (startDate) searchParams.set('startDate', startDate);
      if (endDate) searchParams.set('endDate', endDate);
      const query = searchParams.toString();
      return apiGet<InteractionTrend[]>(`/analytics/trends${query ? `?${query}` : ''}`);
    },
    staleTime: 30 * 1000,
  });
}
