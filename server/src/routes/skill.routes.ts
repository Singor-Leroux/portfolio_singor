import { Router } from 'express';
import {
  getSkills,
  getSkill,
  createSkill,
  updateSkill,
  deleteSkill
} from '../controllers/skill.controller';
import { protect } from '../middleware/auth.middleware';
import { admin } from '../middleware/admin.middleware';

const router = Router();

// Routes publiques (lecture seule)
router.route('/')
  .get(getSkills as any);

router.route('/:id')
  .get(getSkill as any);

// Routes protégées (modification)
router.use(protect as any); // Protection d'authentification pour les routes suivantes

router.route('/')
  .post(admin as any, createSkill as any); // Seul l'admin peut créer

router.route('/:id')
  .put(admin as any, updateSkill as any) // Seul l'admin peut mettre à jour
  .delete(admin as any, deleteSkill as any); // Seul l'admin peut supprimer

export default router;
