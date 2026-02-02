import { useMutation } from '@tanstack/react-query';
import { apiPost } from '../client';
import type { ContactFormData, ContactMessage } from '../types';

/**
 * Hook to submit a contact form message
 */
export function useSubmitContact() {
  return useMutation({
    mutationFn: (data: ContactFormData) => apiPost<ContactMessage>('/contact', data),
  });
}

/**
 * Hook to subscribe to newsletter
 */
export function useNewsletterSubscribe() {
  return useMutation({
    mutationFn: (email: string) => apiPost<{ message: string }>('/newsletter/subscribe', { email }),
  });
}
