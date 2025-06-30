import { Router } from 'express';
import {
  createCertification,
  getCertifications,
  getCertification,
  updateCertification,
  deleteCertification,
} from '../controllers/certification.controller';
import { protect } from '../middleware/auth.middleware';
import { admin } from '../middleware/admin.middleware';
import upload from '../middleware/uploadMiddleware'; // Import upload middleware

const router = Router();

router.route('/')
  .get(getCertifications)
  .post(protect as any, admin as any, upload.single('certificationImage'), createCertification);

router.route('/:id')
  .get(getCertification)
  .put(protect as any, admin as any, upload.single('certificationImage'), updateCertification)
  .delete(protect as any, admin as any, deleteCertification);

export default router;
