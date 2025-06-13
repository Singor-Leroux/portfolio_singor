import { Router } from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getFeaturedProjects,
} from '../controllers/project.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { uploadProjectImage } from '../middleware/projectUpload';

const router = Router();

// Routes publiques
router.get('/featured', getFeaturedProjects);
router.get('/:id', getProject);

// Routes protégées (admin uniquement)
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(getProjects)
  .post(protect, authorize('admin'), uploadProjectImage, createProject);

router
  .route('/:id')
  .put(protect, authorize('admin'), uploadProjectImage, updateProject)
  .delete(protect, authorize('admin'), deleteProject);

export default router;
