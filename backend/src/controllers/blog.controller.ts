import { Response, NextFunction, Request } from 'express';
import { BlogService } from '../services/blog.service';
import { AuthRequest } from '../middleware';
import { ResponseUtil } from '../utils/response';

interface BlogPostParams {
  id?: string;
  slug?: string;
}

interface BlogPostQueryParams {
  page?: string;
  limit?: string;
  tag?: string;
  published?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export class BlogController {
  /**
   * Get all blog posts with pagination, filtering, and search
   * GET /api/blog/posts
   */
  static async getPosts(
    req: Request<unknown, unknown, unknown, BlogPostQueryParams>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        page = '1',
        limit = '10',
        tag,
        published,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      // Validate pagination params
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);

      if (isNaN(pageNum) || pageNum < 1) {
        ResponseUtil.badRequest(res, 'Page must be a positive integer');
        return;
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        ResponseUtil.badRequest(res, 'Limit must be between 1 and 100');
        return;
      }

      // Validate sortBy
      const validSortFields = ['createdAt', 'publishedAt', 'views', 'title'];
      if (sortBy && !validSortFields.includes(sortBy)) {
        ResponseUtil.badRequest(res, `sortBy must be one of: ${validSortFields.join(', ')}`);
        return;
      }

      // Validate sortOrder
      if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
        ResponseUtil.badRequest(res, 'sortOrder must be either asc or desc');
        return;
      }

      const result = await BlogService.getPosts({
        page: pageNum,
        limit: limitNum,
        tag,
        published: published === 'true' ? true : published === 'false' ? false : undefined,
        search,
        sortBy: sortBy as 'createdAt' | 'publishedAt' | 'views' | 'title',
        sortOrder: sortOrder?.toUpperCase() as 'ASC' | 'DESC' | undefined,
      });

      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get published blog posts (public access)
   * GET /api/blog/posts/published
   */
  static async getPublishedPosts(
    req: Request<unknown, unknown, unknown, BlogPostQueryParams>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        page = '1',
        limit = '10',
        tag,
        search,
        sortBy = 'publishedAt',
        sortOrder = 'desc',
      } = req.query;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);

      if (isNaN(pageNum) || pageNum < 1) {
        ResponseUtil.badRequest(res, 'Page must be a positive integer');
        return;
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        ResponseUtil.badRequest(res, 'Limit must be between 1 and 100');
        return;
      }

      const validSortFields = ['createdAt', 'publishedAt', 'views', 'title'];
      if (sortBy && !validSortFields.includes(sortBy)) {
        ResponseUtil.badRequest(res, `sortBy must be one of: ${validSortFields.join(', ')}`);
        return;
      }

      if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
        ResponseUtil.badRequest(res, 'sortOrder must be either asc or desc');
        return;
      }

      const result = await BlogService.getPublishedPosts({
        page: pageNum,
        limit: limitNum,
        tag,
        search,
        sortBy: sortBy as 'createdAt' | 'publishedAt' | 'views' | 'title',
        sortOrder: sortOrder?.toUpperCase() as 'ASC' | 'DESC' | undefined,
      });

      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single blog post by ID
   * GET /api/blog/posts/:id
   */
  static async getPostById(
    req: Request<BlogPostParams>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        ResponseUtil.badRequest(res, 'Invalid blog post ID format');
        return;
      }

      const post = await BlogService.getPostById(id);

      if (!post) {
        ResponseUtil.notFound(res, 'Blog post not found');
        return;
      }

      // Increment views
      await BlogService.incrementViews(id);

      ResponseUtil.success(res, {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        tags: post.tags,
        published: post.published,
        featuredImage: post.coverImage,
        views: post.views + 1,
        readTime: post.readTime,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        publishedAt: post.publishedAt,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single blog post by slug
   * GET /api/blog/posts/slug/:slug
   */
  static async getPostBySlug(
    req: Request<BlogPostParams>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { slug } = req.params;

      if (!slug) {
        ResponseUtil.badRequest(res, 'Slug is required');
        return;
      }

      const post = await BlogService.getPostBySlug(slug);

      if (!post) {
        ResponseUtil.notFound(res, 'Blog post not found');
        return;
      }

      // Only allow access to published posts via slug (public route)
      if (!post.published) {
        ResponseUtil.notFound(res, 'Blog post not found');
        return;
      }

      // Increment views
      await BlogService.incrementViews(post.id);

      ResponseUtil.success(res, {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        tags: post.tags,
        published: post.published,
        featuredImage: post.coverImage,
        views: post.views + 1,
        readTime: post.readTime,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        publishedAt: post.publishedAt,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new blog post
   * POST /api/blog/posts
   */
  static async createPost(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { title, content, excerpt, tags, published, coverImage } = req.body;

      // Validate required fields
      if (!title || typeof title !== 'string') {
        ResponseUtil.validationError(res, 'Title is required and must be a string');
        return;
      }

      if (!content || typeof content !== 'string') {
        ResponseUtil.validationError(res, 'Content is required and must be a string');
        return;
      }

      if (!excerpt || typeof excerpt !== 'string') {
        ResponseUtil.validationError(res, 'Excerpt is required and must be a string');
        return;
      }

      // Validate title length
      if (title.length < 3 || title.length > 200) {
        ResponseUtil.validationError(res, 'Title must be between 3 and 200 characters');
        return;
      }

      // Validate content length
      if (content.length < 10) {
        ResponseUtil.validationError(res, 'Content must be at least 10 characters');
        return;
      }

      // Validate excerpt length
      if (excerpt.length < 10 || excerpt.length > 500) {
        ResponseUtil.validationError(res, 'Excerpt must be between 10 and 500 characters');
        return;
      }

      // Validate tags if provided
      if (tags !== undefined && (!Array.isArray(tags) || tags.length > 10)) {
        ResponseUtil.validationError(res, 'Tags must be an array with at most 10 items');
        return;
      }

      const post = await BlogService.createPost({
        title,
        content,
        excerpt,
        tags,
        published,
        coverImage,
      });

      ResponseUtil.success(res, {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        tags: post.tags,
        published: post.published,
        featuredImage: post.coverImage,
        views: post.views,
        readTime: post.readTime,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        publishedAt: post.publishedAt,
      }, 201);
    } catch (error) {
      if (error instanceof Error && error.name === 'ValidationError') {
        ResponseUtil.validationError(res, error.message);
        return;
      }
      next(error);
    }
  }

  /**
   * Update a blog post
   * PUT /api/blog/posts/:id
   */
  static async updatePost(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const { title, content, excerpt, tags, published, coverImage } = req.body;

      if (!id) {
        ResponseUtil.badRequest(res, 'Invalid blog post ID format');
        return;
      }

      // Validate title if provided
      if (title !== undefined) {
        if (typeof title !== 'string' || title.length < 3 || title.length > 200) {
          ResponseUtil.validationError(res, 'Title must be between 3 and 200 characters');
          return;
        }
      }

      // Validate content if provided
      if (content !== undefined) {
        if (typeof content !== 'string' || content.length < 10) {
          ResponseUtil.validationError(res, 'Content must be at least 10 characters');
          return;
        }
      }

      // Validate excerpt if provided
      if (excerpt !== undefined) {
        if (typeof excerpt !== 'string' || excerpt.length < 10 || excerpt.length > 500) {
          ResponseUtil.validationError(res, 'Excerpt must be between 10 and 500 characters');
          return;
        }
      }

      // Validate tags if provided
      if (tags !== undefined) {
        if (!Array.isArray(tags) || tags.length > 10) {
          ResponseUtil.validationError(res, 'Tags must be an array with at most 10 items');
          return;
        }
      }

      const updateData: Record<string, unknown> = {};
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (excerpt !== undefined) updateData.excerpt = excerpt;
      if (tags !== undefined) updateData.tags = tags;
      if (published !== undefined) updateData.published = published;
      if (coverImage !== undefined) updateData.coverImage = coverImage;

      const post = await BlogService.updatePost(id, updateData);

      if (!post) {
        ResponseUtil.notFound(res, 'Blog post not found');
        return;
      }

      ResponseUtil.success(res, {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        tags: post.tags,
        published: post.published,
        featuredImage: post.coverImage,
        views: post.views,
        readTime: post.readTime,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        publishedAt: post.publishedAt,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ValidationError') {
        ResponseUtil.validationError(res, error.message);
        return;
      }
      next(error);
    }
  }

  /**
   * Delete a blog post
   * DELETE /api/blog/posts/:id
   */
  static async deletePost(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;

      if (!id) {
        ResponseUtil.badRequest(res, 'Invalid blog post ID format');
        return;
      }

      const post = await BlogService.deletePost(id);

      if (!post) {
        ResponseUtil.notFound(res, 'Blog post not found');
        return;
      }

      ResponseUtil.success(res, { message: 'Blog post deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all tags
   * GET /api/blog/tags
   */
  static async getTags(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tags = await BlogService.getAllTags();
      ResponseUtil.success(res, { tags });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recent posts
   * GET /api/blog/posts/recent
   */
  static async getRecentPosts(
    req: Request<unknown, unknown, unknown, { limit?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { limit = '5' } = req.query;
      const limitNum = parseInt(limit, 10);

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 20) {
        ResponseUtil.badRequest(res, 'Limit must be between 1 and 20');
        return;
      }

      const posts = await BlogService.getRecentPosts(limitNum);

      ResponseUtil.success(res, {
        posts: posts.map((post) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          tags: post.tags,
          featuredImage: post.coverImage,
          views: post.views,
          readTime: post.readTime,
          publishedAt: post.publishedAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
}
