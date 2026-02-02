import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '../client';
import type { BlogPost, BlogPostsResponse } from '../types';

const BLOG_QUERY_KEY = ['blog'];

interface BlogQueryParams {
  page?: number;
  limit?: number;
  tag?: string;
  search?: string;
  sortBy?: 'createdAt' | 'publishedAt' | 'views' | 'title';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Hook to fetch published blog posts with pagination and filtering
 */
export function useBlogPosts(params: BlogQueryParams = {}) {
  const { page = 1, limit = 10, tag, search, sortBy = 'publishedAt', sortOrder = 'desc' } = params;

  return useQuery({
    queryKey: [...BLOG_QUERY_KEY, 'posts', { page, limit, tag, search, sortBy, sortOrder }],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      searchParams.set('page', String(page));
      searchParams.set('limit', String(limit));
      searchParams.set('sortBy', sortBy);
      searchParams.set('sortOrder', sortOrder);
      if (tag) searchParams.set('tag', tag);
      if (search) searchParams.set('search', search);

      return apiGet<BlogPostsResponse>(`/blog/posts/published?${searchParams.toString()}`);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch a single blog post by slug
 */
export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: [...BLOG_QUERY_KEY, 'post', slug],
    queryFn: () => apiGet<BlogPost>(`/blog/posts/slug/${slug}`),
    enabled: !!slug,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to fetch recent blog posts
 */
export function useRecentBlogPosts(limit: number = 5) {
  return useQuery({
    queryKey: [...BLOG_QUERY_KEY, 'recent', limit],
    queryFn: () => apiGet<{ posts: BlogPost[] }>(`/blog/posts/recent?limit=${limit}`),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to fetch all blog tags
 */
export function useBlogTags() {
  return useQuery({
    queryKey: [...BLOG_QUERY_KEY, 'tags'],
    queryFn: () => apiGet<{ tags: string[] }>('/blog/tags'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}


// Admin query params (includes published filter)
interface AdminBlogQueryParams extends BlogQueryParams {
  published?: boolean;
}

/**
 * Hook to fetch all blog posts (admin - includes unpublished)
 */
export function useAdminBlogPosts(params: AdminBlogQueryParams = {}) {
  const { page = 1, limit = 10, tag, search, published, sortBy = 'createdAt', sortOrder = 'desc' } = params;

  return useQuery({
    queryKey: [...BLOG_QUERY_KEY, 'admin', 'posts', { page, limit, tag, search, published, sortBy, sortOrder }],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      searchParams.set('page', String(page));
      searchParams.set('limit', String(limit));
      searchParams.set('sortBy', sortBy);
      searchParams.set('sortOrder', sortOrder);
      if (tag) searchParams.set('tag', tag);
      if (search) searchParams.set('search', search);
      if (published !== undefined) searchParams.set('published', String(published));

      return apiGet<BlogPostsResponse>(`/blog/posts?${searchParams.toString()}`);
    },
    staleTime: 1 * 60 * 1000, // 1 minute for admin
  });
}

/**
 * Hook to fetch a single blog post by ID (admin)
 */
export function useAdminBlogPost(id: string) {
  return useQuery({
    queryKey: [...BLOG_QUERY_KEY, 'admin', 'post', id],
    queryFn: () => apiGet<BlogPost>(`/blog/posts/${id}`),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
}

// Blog post create/update data
interface BlogPostData {
  title: string;
  content: string;
  excerpt: string;
  tags?: string[];
  published?: boolean;
  featuredImage?: string;
}

/**
 * Hook to create a new blog post
 */
export function useCreateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BlogPostData) => apiPost<BlogPost>('/blog/posts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEY });
    },
  });
}

/**
 * Hook to update a blog post
 */
export function useUpdateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BlogPostData> }) =>
      apiPut<BlogPost>(`/blog/posts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEY });
    },
  });
}

/**
 * Hook to delete a blog post
 */
export function useDeleteBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiDelete<{ message: string }>(`/blog/posts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEY });
    },
  });
}
