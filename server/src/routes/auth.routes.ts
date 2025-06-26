import { Router, RequestHandler } from 'express';
import { 
  register, 
  login, 
  getMe, 
  updateDetails, 
  updatePassword, 
  logout,
  confirmEmail,
  resendVerificationEmail,
  IAuthResponse
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { 
  registerValidation, 
  loginValidation, 
  updatePasswordValidation, 
  updateProfileValidation 
} from '../middleware/validator.middleware';

const router = Router();

// Routes publiques
router.post('/register', registerValidation, register as unknown as RequestHandler);
router.post('/login', loginValidation, login as unknown as RequestHandler);
router.get('/confirm-email', confirmEmail as unknown as RequestHandler);
router.post('/resend-verification-email', resendVerificationEmail as unknown as RequestHandler);

// Middleware de protection des routes
router.use(protect as unknown as RequestHandler);

// Routes protégées
router.get('/me', getMe as unknown as RequestHandler);
router.put('/updatedetails', updateProfileValidation, updateDetails as unknown as RequestHandler);
router.put('/updatepassword', updatePasswordValidation, updatePassword as unknown as RequestHandler);
router.get('/logout', logout as unknown as RequestHandler);

export default router;
