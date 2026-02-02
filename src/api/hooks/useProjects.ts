import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '../client';
import type { Project, ProjectsResponse } from '../types';

const PROJECTS_QUERY_KEY = ['projects'];

interface ProjectsQueryParams {
  page?: number;
  limit?: number;
  featured?: boolean;
  technology?: string;
}

/**
 * Hook to fetch paginated projects list
 */
export function useProjects(params: ProjectsQueryParams = {}) {
  const { page = 1, limit = 10, featured, technology } = params;

  return useQuery({
    queryKey: [...PROJECTS_QUERY_KEY, { page, limit, featured, technology }],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      searchParams.set('page', String(page));
      searchParams.set('limit', String(limit));
      if (featured !== undefined) searchParams.set('featured', String(featured));
      if (technology) searchParams.set('technology', technology);

      return apiGet<ProjectsResponse>(`/projects?${searchParams.toString()}`);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch a single project by ID
 * Note: This also increments the view count on the backend
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: [...PROJECTS_QUERY_KEY, id],
    queryFn: () => apiGet<Project>(`/projects/${id}`),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to record a project view (increments view count)
 */
export function useRecordProjectView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiGet<Project>(`/projects/${id}`),
    onSuccess: (data) => {
      // Update the project in cache with new view count
      queryClient.setQueryData<Project>([...PROJECTS_QUERY_KEY, data.id], data);
      
      // Update the projects list with new view count
      queryClient.setQueriesData<ProjectsResponse>(
        { queryKey: PROJECTS_QUERY_KEY },
        (old) => {
          if (!old?.projects) return old;
          return {
            ...old,
            projects: old.projects.map((p) =>
              p.id === data.id ? { ...p, views: data.views } : p
            ),
          };
        }
      );
    },
  });
}

/**
 * Hook to create a new project (admin only)
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Project, 'id' | 'likes' | 'views' | 'shares' | 'createdAt' | 'updatedAt'>) =>
      apiPost<Project>('/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}

/**
 * Hook to update a project (admin only)
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      apiPut<Project>(`/projects/${id}`, data),
    onSuccess: (updatedProject) => {
      queryClient.setQueryData([...PROJECTS_QUERY_KEY, updatedProject.id], updatedProject);
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}

/**
 * Hook to delete a project (admin only)
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}

/**
 * Hook to like a project
 */
export function useLikeProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiPost<{ id: string; likes: number }>(`/projects/${id}/like`),
    onMutate: async (id: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: PROJECTS_QUERY_KEY });

      // Snapshot the previous value for rollback
      const previousProjects = queryClient.getQueriesData({ queryKey: PROJECTS_QUERY_KEY });

      // Optimistically update the projects list
      queryClient.setQueriesData<ProjectsResponse>(
        { queryKey: PROJECTS_QUERY_KEY },
        (old) => {
          if (!old?.projects) return old;
          return {
            ...old,
            projects: old.projects.map((p) =>
              p.id === id ? { ...p, likes: p.likes + 1 } : p
            ),
          };
        }
      );

      return { previousProjects };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousProjects) {
        context.previousProjects.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (data, id) => {
      // Update with actual server value
      queryClient.setQueryData<Project>([...PROJECTS_QUERY_KEY, id], (old) =>
        old ? { ...old, likes: data.likes } : old
      );
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}

/**
 * Hook to share a project (records share statistics)
 */
export function useShareProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiPost<{ id: string; shares: number }>(`/projects/${id}/share`),
    onMutate: async (id: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: PROJECTS_QUERY_KEY });

      // Snapshot the previous value for rollback
      const previousProjects = queryClient.getQueriesData({ queryKey: PROJECTS_QUERY_KEY });

      // Optimistically update the projects list
      queryClient.setQueriesData<ProjectsResponse>(
        { queryKey: PROJECTS_QUERY_KEY },
        (old) => {
          if (!old?.projects) return old;
          return {
            ...old,
            projects: old.projects.map((p) =>
              p.id === id ? { ...p, shares: (p.shares || 0) + 1 } : p
            ),
          };
        }
      );

      return { previousProjects };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousProjects) {
        context.previousProjects.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (data, id) => {
      // Update with actual server value
      queryClient.setQueryData<Project>([...PROJECTS_QUERY_KEY, id], (old) =>
        old ? { ...old, shares: data.shares } : old
      );
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}

/**
 * Hook to fetch all technologies for filtering
 */
export function useTechnologies() {
  return useQuery({
    queryKey: ['technologies'],
    queryFn: () => apiGet<{ technologies: string[] }>('/projects/technologies'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
