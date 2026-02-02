/**
 * Models Index
 * 
 * This file exports all database models and type definitions for the hybrid database architecture.
 * 
 * Architecture:
 * - MySQL (TypeORM): Structured business data with ACID transactions
 * - MongoDB (Mongoose): Unstructured/semi-structured analytics and logs
 */

// ============================================================================
// MySQL Models (TypeORM Entities) - Structured Data
// ============================================================================

// Authentication & Authorization
export { User } from './user.model';
export { RefreshToken } from './refreshToken.model';

// Content Management
export { Profile } from './profile.model';
export { Project } from './project.model';
export { BlogPost } from './blogPost.model';

// Communication
export { ContactMessage } from './contactMessage.model';
export { Newsletter } from './newsletter.model';

// ============================================================================
// MongoDB Models (Mongoose) - Unstructured/Semi-structured Data
// ============================================================================

// Analytics & Tracking
export { PageView } from './analytics.model';
export { ProjectInteraction } from './analytics.model';

// File Management
export { FileMetadata } from './analytics.model';

// System Monitoring
export { SystemLog } from './analytics.model';

// ============================================================================
// Type Definitions
// ============================================================================

// MongoDB Document Interfaces
export type { IPageView } from './analytics.model';
export type { IProjectInteraction } from './analytics.model';
export type { IFileMetadata } from './analytics.model';
export type { ISystemLog } from './analytics.model';

// Profile Related Types
export type { IExperience } from './profile.model';
export type { ISocial } from './profile.model';
