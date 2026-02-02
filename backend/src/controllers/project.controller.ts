import { Response, NextFunction, Request } from 'express';
import { ProjectService } from '../services/project.service';
import { AuthRequest } from '../middleware';
import { ResponseUtil } from '../utils/response';

// Define typed request interfaces
interface ProjectParams {
  id: string;
}

interface ProjectQueryParams {
  page?: string;
  limit?: string;
  technology?: string;
  featured?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export class ProjectController {
  /**
   * Get all projects with pagination, filtering, and search
   * GET /api/projects
   */
  static async getProjects(
    req: Request<unknown, unknown, unknown, ProjectQueryParams>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        page = '1',
        limit = '10',
        featured,
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
      const validSortFields = ['createdAt', 'likes', 'views', 'title'];
      if (sortBy && !validSortFields.includes(sortBy)) {
        ResponseUtil.badRequest(res, `sortBy must be one of: ${validSortFields.join(', ')}`);
        return;
      }

      // Validate sortOrder
      if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
        ResponseUtil.badRequest(res, 'sortOrder must be either asc or desc');
        return;
      }

      const result = await ProjectService.getProjects({
        page: pageNum,
        limit: limitNum,
        featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
        search,
        sortBy: sortBy as 'createdAt' | 'likes' | 'views' | 'title',
        sortOrder: sortOrder?.toUpperCase() as 'ASC' | 'DESC' | undefined,
      });

      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single project by ID
   * GET /api/projects/:id
   */
  static async getProjectById(
    req: Request<ProjectParams>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        ResponseUtil.badRequest(res, 'Invalid project ID format');
        return;
      }

      const project = await ProjectService.getProjectById(id);

      if (!project) {
        ResponseUtil.notFound(res, 'Project not found');
        return;
      }

      // Increment views
      await ProjectService.incrementViews(id);

      ResponseUtil.success(res, {
        id: project.id,
        title: project.title,
        description: project.description,
        technologies: project.technologies,
        images: project.images,
        githubUrl: project.githubUrl,
        liveUrl: project.liveUrl,
        featured: project.featured,
        likes: project.likes,
        views: project.views + 1, // Include the incremented view
        shares: project.shares,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new project
   * POST /api/projects
   */
  static async createProject(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { title, description, technologies, images, githubUrl, liveUrl, featured } = req.body;

      // Validate required fields
      if (!title || typeof title !== 'string') {
        ResponseUtil.validationError(res, 'Title is required and must be a string');
        return;
      }

      if (!description || typeof description !== 'string') {
        ResponseUtil.validationError(res, 'Description is required and must be a string');
        return;
      }

      if (!technologies || !Array.isArray(technologies) || technologies.length === 0) {
        ResponseUtil.validationError(res, 'Technologies is required and must be a non-empty array');
        return;
      }

      // Validate title length
      if (title.length < 3 || title.length > 200) {
        ResponseUtil.validationError(res, 'Title must be between 3 and 200 characters');
        return;
      }

      // Validate description length
      if (description.length < 10 || description.length > 5000) {
        ResponseUtil.validationError(res, 'Description must be between 10 and 5000 characters');
        return;
      }

      // Validate technologies
      if (technologies.length > 30) {
        ResponseUtil.validationError(res, 'Cannot have more than 30 technologies');
        return;
      }

      // Validate images if provided
      if (images && (!Array.isArray(images) || images.length > 10)) {
        ResponseUtil.validationError(res, 'Images must be an array with at most 10 items');
        return;
      }

      const project = await ProjectService.createProject({
        title,
        description,
        technologies,
        images,
        githubUrl,
        liveUrl,
        featured,
      });

      ResponseUtil.success(res, {
        id: project.id,
        title: project.title,
        description: project.description,
        technologies: project.technologies,
        images: project.images,
        githubUrl: project.githubUrl,
        liveUrl: project.liveUrl,
        featured: project.featured,
        likes: project.likes,
        views: project.views,
        shares: project.shares,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
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
   * Update a project
   * PUT /api/projects/:id
   */
  static async updateProject(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const { title, description, technologies, images, githubUrl, liveUrl, featured } = req.body;

      if (!id) {
        ResponseUtil.badRequest(res, 'Invalid project ID format');
        return;
      }

      // Validate title if provided
      if (title !== undefined) {
        if (typeof title !== 'string' || title.length < 3 || title.length > 200) {
          ResponseUtil.validationError(res, 'Title must be between 3 and 200 characters');
          return;
        }
      }

      // Validate description if provided
      if (description !== undefined) {
        if (typeof description !== 'string' || description.length < 10 || description.length > 5000) {
          ResponseUtil.validationError(res, 'Description must be between 10 and 5000 characters');
          return;
        }
      }

      // Validate technologies if provided
      if (technologies !== undefined) {
        if (!Array.isArray(technologies) || technologies.length === 0 || technologies.length > 30) {
          ResponseUtil.validationError(res, 'Technologies must be an array with 1-30 items');
          return;
        }
      }

      // Validate images if provided
      if (images !== undefined) {
        if (!Array.isArray(images) || images.length > 10) {
          ResponseUtil.validationError(res, 'Images must be an array with at most 10 items');
          return;
        }
      }

      const updateData: Record<string, unknown> = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (technologies !== undefined) updateData.technologies = technologies;
      if (images !== undefined) updateData.images = images;
      if (githubUrl !== undefined) updateData.githubUrl = githubUrl;
      if (liveUrl !== undefined) updateData.liveUrl = liveUrl;
      if (featured !== undefined) updateData.featured = featured;

      const project = await ProjectService.updateProject(id, updateData);

      if (!project) {
        ResponseUtil.notFound(res, 'Project not found');
        return;
      }

      ResponseUtil.success(res, {
        id: project.id,
        title: project.title,
        description: project.description,
        technologies: project.technologies,
        images: project.images,
        githubUrl: project.githubUrl,
        liveUrl: project.liveUrl,
        featured: project.featured,
        likes: project.likes,
        views: project.views,
        shares: project.shares,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
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
   * Delete a project
   * DELETE /api/projects/:id
   */
  static async deleteProject(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;

      if (!id) {
        ResponseUtil.badRequest(res, 'Invalid project ID format');
        return;
      }

      const project = await ProjectService.deleteProject(id);

      if (!project) {
        ResponseUtil.notFound(res, 'Project not found');
        return;
      }

      ResponseUtil.success(res, { message: 'Project deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Like a project
   * POST /api/projects/:id/like
   */
  static async likeProject(
    req: Request<ProjectParams>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        ResponseUtil.badRequest(res, 'Invalid project ID format');
        return;
      }

      const project = await ProjectService.incrementLikes(id);

      if (!project) {
        ResponseUtil.notFound(res, 'Project not found');
        return;
      }

      ResponseUtil.success(res, {
        id: project.id,
        likes: project.likes,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Share a project (record share statistics)
   * POST /api/projects/:id/share
   */
  static async shareProject(
    req: Request<ProjectParams>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        ResponseUtil.badRequest(res, 'Invalid project ID format');
        return;
      }

      const project = await ProjectService.incrementShares(id);

      if (!project) {
        ResponseUtil.notFound(res, 'Project not found');
        return;
      }

      ResponseUtil.success(res, {
        id: project.id,
        shares: project.shares,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all unique technologies used in projects
   * GET /api/projects/technologies
   */
  static async getTechnologies(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const technologies = await ProjectService.getAllTechnologies();
      ResponseUtil.success(res, { technologies });
    } catch (error) {
      next(error);
    }
  }
}
