import { Router } from 'express';
import {
  createExperience,
  getExperiences,
  getExperienceById,
  updateExperience,
  deleteExperience,
} from '../controllers/experience.controller';
import { protect } from '../middleware/auth.middleware'; // Assurez-vous que le chemin est correct
import { admin } from '../middleware/admin.middleware';   // Assurez-vous que le chemin est correct

const router = Router();

// Routes publiques (si n\u00E9cessaire, sinon prot\u00E9gez-les aussi)
router.route('/')
  .get(getExperiences) // Tout le monde peut voir les exp\u00E9riences
  .post(protect as any, admin as any, createExperience); // Seul l'admin peut cr\u00E9er

router.route('/:id')
  .get(getExperienceById) // Tout le monde peut voir une exp\u00E9rience sp\u00E9cifique
  .put(protect as any, admin as any, updateExperience) // Seul l'admin peut mettre \u00E0 jour
  .delete(protect as any, admin as any, deleteExperience); // Seul l'admin peut supprimer

export default router;
