import { Router } from 'express';
import { 
  getUsers, 
  getUser, 
  updateUser, 
  deleteUser, 
  changeUserRole, 
  toggleUserStatus 
} from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Toutes protégées
router.use(protect as any);

// Routes accessibles par tous les utilisateurs authentifiés
router.route('/')
  .get(getUsers as any);

router.route('/:id')
  .get(getUser as any)
  .put(updateUser as any)
  .delete(deleteUser as any);

// Routes admin uniquement
router.route('/:id/role')
  .put(changeUserRole as any);

router.route('/:id/suspend')
  .put(toggleUserStatus as any);

export default router;
