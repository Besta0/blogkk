// Profile hooks
export { useProfile, useUpdateProfile } from './useProfile';

// Project hooks
export {
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useLikeProject,
  useRecordProjectView,
  useTechnologies,
} from './useProjects';

// Contact hooks
export { useSubmitContact, useNewsletterSubscribe } from './useContact';

// Blog hooks
export { useBlogPosts, useBlogPost, useRecentBlogPosts, useBlogTags } from './useBlog';

// Analytics hooks
export {
  usePageViewStats,
  useProjectStats,
  useRealTimeStats,
  useAnalyticsSummary,
  useRecentPageViews,
  useRecordPageView,
  useRecordInteraction,
} from './useAnalytics';
