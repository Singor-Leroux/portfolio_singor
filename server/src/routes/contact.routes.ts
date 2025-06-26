import { Router } from 'express';
import { body } from 'express-validator';
import { sendContactEmail } from '../controllers/contact.controller';

const router = Router();

// Validation des données du formulaire de contact
const contactValidation = [
  body('name').trim().notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('Veuillez fournir un email valide'),
  body('subject').trim().notEmpty().withMessage('Le sujet est requis'),
  body('message').trim().notEmpty().withMessage('Le message est requis'),
];

// Route pour envoyer un email de contact
router.post('/', contactValidation, sendContactEmail);

export default router;
