import { Router } from 'express';
import { requireAdmin, validate, validateUUID, projectValidationRules } from '../middleware';
import { ProjectController } from '../controllers/project.controller';

const router = Router();

/**
 * @route   GET /api/projects
 * @desc    Get all projects with pagination, filtering, and search
 * @access  Public
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10, max: 100)
 * @query   featured - Filter by featured status (true/false)
 * @query   search - Search in title, description, and technologies
 * @query   sortBy - Sort field (createdAt, likes, views, title)
 * @query   sortOrder - Sort order (asc, desc)
 */
router.get('/', ProjectController.getProjects);

/**
 * @route   GET /api/projects/technologies
 * @desc    Get all unique technologies used in projects
 * @access  Public
 */
router.get('/technologies', ProjectController.getTechnologies);

/**
 * @route   GET /api/projects/:id
 * @desc    Get a single project by ID
 * @access  Public
 */
router.get('/:id', ProjectController.getProjectById);

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private (Admin only)
 */
router.post('/', requireAdmin, validate(projectValidationRules), ProjectController.createProject);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update a project
 * @access  Private (Admin only)
 */
router.put('/:id', requireAdmin, validateUUID('id'), ProjectController.updateProject);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project
 * @access  Private (Admin only)
 */
router.delete('/:id', requireAdmin, validateUUID('id'), ProjectController.deleteProject);

/**
 * @route   POST /api/projects/:id/like
 * @desc    Like a project
 * @access  Public
 */
router.post('/:id/like', ProjectController.likeProject);

/**
 * @route   POST /api/projects/:id/share
 * @desc    Share a project (record share statistics)
 * @access  Public
 */
router.post('/:id/share', ProjectController.shareProject);

export default router;
