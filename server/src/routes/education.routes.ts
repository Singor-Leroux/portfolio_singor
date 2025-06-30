import { Router } from 'express';
import {
  createEducation,
  getEducations,
  getEducation,
  updateEducation,
  deleteEducation,
} from '../controllers/education.controller';
import { protect } from '../middleware/auth.middleware';
import { admin } from '../middleware/admin.middleware';

const router = Router();

router.route('/')
  .get(getEducations)
  .post(protect as any, admin as any, createEducation);

router.route('/:id')
  .get(getEducation)
  .put(protect as any, admin as any, updateEducation)
  .delete(protect as any, admin as any, deleteEducation);

export default router;
