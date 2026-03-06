/**
 * URL utility functions for blog slug handling
 * Converts between readable titles and URL-friendly slugs
 */

// Convert a title to URL-friendly slug (spaces become underscores for URL readability)
export function toSlug(title: string): string {
  return title.trim().replace(/\s+/g, '_')
}

// Convert URL slug back to readable title (optional, for display)
export function fromSlug(slug: string): string {
  return slug.replace(/_/g, ' ')
}

// Get the blog slug from current URL and convert to backend format
// URL uses underscores (React_Performance_Tips) but backend uses dashes (react-performance-tips)
export function getBlogSlugFromUrl(): string | null {
  const hash = window.location.hash
  // Match #/blog/Some_Title
  const match = hash.match(/^#\/blog\/(.+)$/)
  if (!match) return null
  // Convert URL slug (with _) to backend slug (with -)
  return match[1].replace(/_/g, '-').toLowerCase()
}

// Navigate to a blog post
export function navigateToBlog(title: string): void {
  const slug = toSlug(title)
  window.location.hash = `/blog/${slug}`
}

// Navigate to home
export function navigateToHome(): void {
  window.location.hash = ''
}

// Check if we're on a blog post page
export function isBlogPostPage(): boolean {
  return window.location.hash.startsWith('#/blog/')
}
