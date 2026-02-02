/**
 * API Types for the Portfolio Frontend
 * Based on the design document data models
 */

// Social links structure
export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  email?: string;
  website?: string;
}

// Experience entry
export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  current: boolean;
}

// Profile data
export interface Profile {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  skills: string[];
  experience: Experience[];
  social: SocialLinks;
  createdAt?: string;
  updatedAt?: string;
}

// Project data
export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  images: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  likes: number;
  views: number;
  shares?: number;
  createdAt: string;
  updatedAt: string;
}

// Paginated projects response
export interface ProjectsResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Blog post data
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string[];
  published: boolean;
  featuredImage?: string;
  views: number;
  readTime: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// Paginated blog posts response
export interface BlogPostsResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Contact form data
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Contact message response
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  replied: boolean;
  createdAt: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: AuthUser;
}

// File upload response
export interface UploadResponse {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

// Newsletter subscription
export interface NewsletterSubscription {
  email: string;
}

// Analytics types
export interface PageViewStats {
  totalViews: number;
  uniqueVisitors: number;
  topPages: Array<{ page: string; views: number }>;
  viewsByDate: Array<{ date: string; views: number }>;
}

export interface ProjectStats {
  projectId: string;
  views: number;
  likes: number;
  shares: number;
}

export interface RealTimeStats {
  viewsLast24h: number;
  viewsLastHour: number;
  activePages: Array<{ page: string; views: number }>;
}

export interface AnalyticsSummary {
  pageViews: PageViewStats;
  projectStats: ProjectStats[];
  realTime: RealTimeStats;
  period: {
    startDate?: string;
    endDate?: string;
  };
}

export interface PageView {
  id: string;
  page: string;
  userAgent?: string;
  referrer?: string;
  ip: string;
  country?: string;
  sessionId?: string;
  createdAt: string;
}

export interface RecentPageViewsResponse {
  views: PageView[];
  total: number;
  page: number;
  limit: number;
}

// User behavior analytics types
export interface UserBehaviorStats {
  totalSessions: number;
  avgPagesPerSession: number;
  topReferrers: Array<{ referrer: string; count: number }>;
  deviceBreakdown: Array<{ device: string; count: number }>;
  hourlyDistribution: Array<{ hour: number; views: number }>;
  weekdayDistribution: Array<{ day: string; views: number }>;
}

// Interaction trends type
export interface InteractionTrend {
  date: string;
  views: number;
  likes: number;
  shares: number;
}
