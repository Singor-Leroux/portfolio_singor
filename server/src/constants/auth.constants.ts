// Durées d'expiration en millisecondes
export const EMAIL_VERIFICATION_EXPIRES_IN = 24 * 60 * 60 * 1000; // 24 heures
export const PASSWORD_RESET_EXPIRES_IN = 10 * 60 * 1000; // 10 minutes

// Rôles d'utilisateur
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

// Statuts d'utilisateur
export const USER_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
} as const;

// Types de tokens
export const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  EMAIL_VERIFICATION: 'emailVerification',
  PASSWORD_RESET: 'passwordReset',
} as const;

// Messages d'erreur
export const ERROR_MESSAGES = {
  USER_EXISTS: 'Un utilisateur avec cet email existe déjà',
  INVALID_CREDENTIALS: 'Identifiants invalides',
  ACCOUNT_NOT_ACTIVE: 'Votre compte n\'est pas encore activé. Veuillez vérifier votre email pour activer votre compte.',
  ACCOUNT_SUSPENDED: 'Votre compte a été suspendu. Veuillez contacter l\'administrateur.',
  ACCOUNT_BANNED: 'Votre compte a été banni. Contactez le support pour plus d\'informations.',
  TOKEN_INVALID: 'Jeton invalide ou expiré',
  TOKEN_EXPIRED: 'Le jeton a expiré',
  TOKEN_NOT_FOUND: 'Jeton non trouvé',
  EMAIL_VERIFICATION_REQUIRED: 'Veuillez vérifier votre adresse email avant de vous connecter',
  PASSWORD_RESET_EXPIRED: 'Le lien de réinitialisation du mot de passe a expiré',
} as const;

// Messages de succès
export const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: 'Inscription réussie. Veuillez vérifier votre email pour activer votre compte.',
  LOGIN_SUCCESS: 'Connexion réussie',
  LOGOUT_SUCCESS: 'Déconnexion réussie',
  EMAIL_VERIFICATION_SENT: 'Email de vérification envoyé avec succès',
  EMAIL_VERIFIED: 'Email vérifié avec succès',
  PASSWORD_RESET_EMAIL_SENT: 'Instructions de réinitialisation du mot de passe envoyées par email',
  PASSWORD_RESET_SUCCESS: 'Mot de passe réinitialisé avec succès',
  ACCOUNT_ACTIVATED: 'Compte activé avec succès',
} as const;
