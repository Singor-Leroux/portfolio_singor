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
router.get('/', getProjects);

// Routes protégées (admin uniquement)
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .post(uploadProjectImage, createProject);

router
  .route('/:id')
  .put(uploadProjectImage, updateProject)
  .delete(deleteProject);

export default router;
