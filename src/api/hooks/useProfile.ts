import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch } from '../client';
import type { Profile } from '../types';

const PROFILE_QUERY_KEY = ['profile'];

/**
 * Hook to fetch the profile data
 */
export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => apiGet<Profile>('/profile'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update the profile data (admin only)
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Profile>) => apiPatch<Profile>('/profile', data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, updatedProfile);
    },
  });
}
