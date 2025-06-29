import { body, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Middleware pour gérer les erreurs de validation
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Formater les erreurs pour une meilleure lisibilité
    const formattedErrors = errors.array().map(err => ({
      field: (err as any).path || 'unknown',
      message: err.msg,
      value: (err as any).value,
    }));

    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors: formattedErrors,
    });
  };
};

// Règles de validation pour l'inscription
export const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('Le prénom est requis')
    .isLength({ min: 2, max: 50 }).withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('Le nom de famille est requis')
    .isLength({ min: 2, max: 50 }).withMessage('Le nom de famille doit contenir entre 2 et 50 caractères'),
  
  body('title')
    .trim()
    .notEmpty().withMessage('Le titre est requis')
    .isLength({ min: 2, max: 100 }).withMessage('Le titre doit contenir entre 2 et 100 caractères'),
  
  body('about')
    .trim()
    .optional()
    .isLength({ max: 1000 }).withMessage('La description ne doit pas dépasser 1000 caractères'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Veuillez fournir un email valide')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis')
    .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
    .matches(/\d/).withMessage('Le mot de passe doit contenir au moins un chiffre')
    .matches(/[a-z]/).withMessage('Le mot de passe doit contenir au moins une lettre minuscule')
    .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une lettre majuscule'),
  
  body('confirmPassword')
    .notEmpty().withMessage('La confirmation du mot de passe est requise')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      return true;
    }),
  
  body('role')
    .optional()
    .isIn(['user', 'admin']).withMessage('Rôle invalide'),
];

// Règles de validation pour la connexion
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Veuillez fournir un email valide'),
  
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis'),
];

// Règles de validation pour la mise à jour du mot de passe
export const updatePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Le mot de passe actuel est requis'),
  
  body('newPassword')
    .notEmpty().withMessage('Le nouveau mot de passe est requis')
    .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
    .matches(/\d/).withMessage('Le mot de passe doit contenir au moins un chiffre')
    .matches(/[a-z]/).withMessage('Le mot de passe doit contenir au moins une lettre minuscule')
    .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une lettre majuscule')
    .not().matches(/^$|\s+/).withMessage('Le mot de passe ne doit pas contenir d\'espaces'),
  
  body('confirmNewPassword')
    .notEmpty().withMessage('La confirmation du nouveau mot de passe est requise')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Les nouveaux mots de passe ne correspondent pas');
      }
      return true;
    }),
];

// Règles de validation pour la mise à jour du profil
export const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .notEmpty().withMessage('Le prénom ne peut pas être vide')
    .isLength({ min: 2, max: 50 }).withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
  
  body('lastName')
    .optional()
    .trim()
    .notEmpty().withMessage('Le nom de famille ne peut pas être vide')
    .isLength({ min: 2, max: 50 }).withMessage('Le nom de famille doit contenir entre 2 et 50 caractères'),
  
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Le titre ne peut pas être vide')
    .isLength({ min: 2, max: 100 }).withMessage('Le titre doit contenir entre 2 et 100 caractères'),
  
  body('about')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('La description ne doit pas dépasser 1000 caractères'),
  
  body('email')
    .optional()
    .trim()
    .notEmpty().withMessage('L\'email ne peut pas être vide')
    .isEmail().withMessage('Veuillez fournir un email valide')
    .normalizeEmail(),
    
  body('phone')
    .optional()
    .trim()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/).withMessage('Numéro de téléphone invalide'),
    
  body('address')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('L\'adresse ne doit pas dépasser 255 caractères'),
    
  body('socialLinks.github')
    .optional()
    .trim()
    .isURL().withMessage('Le lien GitHub doit être une URL valide'),
    
  body('socialLinks.linkedin')
    .optional()
    .trim()
    .isURL().withMessage('Le lien LinkedIn doit être une URL valide'),
    
  body('socialLinks.twitter')
    .optional()
    .trim()
    .isURL().withMessage('Le lien Twitter doit être une URL valide'),
];

// Règles de validation pour la réinitialisation du mot de passe
export const resetPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Veuillez fournir un email valide'),
];

// Règles de validation pour la définition d'un nouveau mot de passe
export const newPasswordValidation = [
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis')
    .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
    .matches(/\d/).withMessage('Le mot de passe doit contenir au moins un chiffre')
    .matches(/[a-z]/).withMessage('Le mot de passe doit contenir au moins une lettre minuscule')
    .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une lettre majuscule'),
  
  body('confirmPassword')
    .notEmpty().withMessage('La confirmation du mot de passe est requise')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      return true;
    }),
];
