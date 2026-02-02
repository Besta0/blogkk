import { Router } from 'express';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import projectRoutes from './project.routes';
import uploadRoutes from './upload.routes';
import contactRoutes from './contact.routes';
import newsletterRoutes from './newsletter.routes';
import blogRoutes from './blog.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/projects', projectRoutes);
router.use('/upload', uploadRoutes);
router.use('/contact', contactRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/blog', blogRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
