import { Router } from 'express';
import { requireAdmin, validate, validateUUID, blogPostValidationRules } from '../middleware';
import { BlogController } from '../controllers/blog.controller';

const router = Router();

/**
 * @route   GET /api/blog/tags
 * @desc    Get all unique tags used across blog posts
 * @access  Public
 */
router.get('/tags', BlogController.getTags);

/**
 * @route   GET /api/blog/posts/recent
 * @desc    Get recent published blog posts
 * @access  Public
 * @query   limit - Number of posts to return (default: 5, max: 20)
 */
router.get('/posts/recent', BlogController.getRecentPosts);

/**
 * @route   GET /api/blog/posts/published
 * @desc    Get published blog posts with pagination, filtering, and search
 * @access  Public
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10, max: 100)
 * @query   tag - Filter by tag
 * @query   search - Search in title, excerpt, content, and tags
 * @query   sortBy - Sort field (createdAt, publishedAt, views, title)
 * @query   sortOrder - Sort order (asc, desc)
 */
router.get('/posts/published', BlogController.getPublishedPosts);

/**
 * @route   GET /api/blog/posts/slug/:slug
 * @desc    Get a single published blog post by slug
 * @access  Public
 */
router.get('/posts/slug/:slug', BlogController.getPostBySlug);

/**
 * @route   GET /api/blog/posts
 * @desc    Get all blog posts with pagination, filtering, and search (admin)
 * @access  Private (Admin only)
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10, max: 100)
 * @query   tag - Filter by tag
 * @query   published - Filter by published status (true/false)
 * @query   search - Search in title, excerpt, content, and tags
 * @query   sortBy - Sort field (createdAt, publishedAt, views, title)
 * @query   sortOrder - Sort order (asc, desc)
 */
router.get('/posts', requireAdmin, BlogController.getPosts);

/**
 * @route   GET /api/blog/posts/:id
 * @desc    Get a single blog post by ID
 * @access  Private (Admin only)
 */
router.get('/posts/:id', requireAdmin, validateUUID('id'), BlogController.getPostById);

/**
 * @route   POST /api/blog/posts
 * @desc    Create a new blog post
 * @access  Private (Admin only)
 */
router.post('/posts', requireAdmin, validate(blogPostValidationRules), BlogController.createPost);

/**
 * @route   PUT /api/blog/posts/:id
 * @desc    Update a blog post
 * @access  Private (Admin only)
 */
router.put('/posts/:id', requireAdmin, validateUUID('id'), BlogController.updatePost);

/**
 * @route   DELETE /api/blog/posts/:id
 * @desc    Delete a blog post
 * @access  Private (Admin only)
 */
router.delete('/posts/:id', requireAdmin, validateUUID('id'), BlogController.deletePost);

export default router;
