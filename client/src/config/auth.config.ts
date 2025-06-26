/**
 * Configuration d'authentification pour l'application
 * Les valeurs sont chargées depuis les variables d'environnement
 */

const authConfig = {
  // URL de base de l'API
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  
  // Configuration des tokens
  token: {
    name: import.meta.env.VITE_TOKEN_NAME || 'portfolio_token',
    refreshName: import.meta.env.VITE_REFRESH_TOKEN_NAME || 'portfolio_refresh_token',
    expiresIn: import.meta.env.VITE_TOKEN_EXPIRES_IN || '7d',
  },
  
  // URL du frontend pour les redirections
  clientUrl: import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000',
  
  // Chemins des routes d'authentification
  routes: {
    login: '/login',
    register: '/register',
    logout: '/logout',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    confirmEmail: '/confirm-email',
    profile: '/profile',
  },
  
  // Configuration des endpoints d'API
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      logout: '/auth/logout',
      me: '/auth/me',
      refresh: '/auth/refresh-token',
      confirmEmail: '/auth/confirm-email',
      resendVerificationEmail: '/auth/resend-verification-email',
      forgotPassword: '/auth/forgot-password',
      resetPassword: '/auth/reset-password',
      updateProfile: '/auth/updatedetails',
      updatePassword: '/auth/updatepassword',
    },
  },
  
  // Configuration des messages d'erreur par défaut
  messages: {
    errors: {
      default: 'Une erreur est survenue. Veuillez réessayer.',
      network: 'Erreur de connexion au serveur. Veuillez vérifier votre connexion internet.',
      unauthorized: 'Vous devez être connecté pour accéder à cette page.',
      forbidden: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource.',
      notFound: 'La ressource demandée est introuvable.',
      serverError: 'Une erreur est survenue sur le serveur. Veuillez réessayer plus tard.',
      invalidCredentials: 'Email ou mot de passe incorrect.',
      emailAlreadyExists: 'Un compte existe déjà avec cette adresse email.',
      emailNotVerified: 'Votre adresse email n\'a pas encore été vérifiée. Veuillez vérifier votre boîte mail.',
      invalidToken: 'Le lien de confirmation est invalide ou a expiré.',
      passwordTooShort: 'Le mot de passe doit contenir au moins 8 caractères.',
      passwordNoMatch: 'Les mots de passe ne correspondent pas.',
    },
    success: {
      login: 'Connexion réussie !',
      logout: 'Déconnexion réussie. À bientôt !',
      register: 'Inscription réussie ! Veuillez vérifier votre email pour activer votre compte.',
      emailVerified: 'Votre adresse email a été vérifiée avec succès. Vous pouvez maintenant vous connecter.',
      passwordReset: 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.',
      profileUpdated: 'Votre profil a été mis à jour avec succès.',
      passwordUpdated: 'Votre mot de passe a été mis à jour avec succès.',
    },
  },
  
  // Configuration des règles de validation des mots de passe
  passwordRules: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
  
  // Mode débogage (affiche les logs de débogage)
  debug: import.meta.env.VITE_DEBUG === 'true' || false,
};

export default authConfig;
