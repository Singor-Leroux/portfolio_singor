import { Router } from 'express';
import { 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  updateUserRole 
} from '../controllers/admin.controller';
import { protect } from '../middleware/auth.middleware';
import { admin } from '../middleware/admin.middleware';

const router = Router();

// Appliquer la protection d'authentification et d'administration à toutes les routes
router.use(protect as any, admin as any);

/**
 * Routes pour la gestion des utilisateurs par l'administrateur
 */
router.route('/users')
  .get(getUsers as any);

router.route('/users/:id')
  .get(getUserById as any)
  .put(updateUser as any)
  .delete(deleteUser as any);

router.route('/users/:id/role')
  .put(updateUserRole as any);

export default router;
