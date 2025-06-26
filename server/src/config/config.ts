import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  contactRecipient?: string;
}

interface Config {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  email: EmailConfig;
  clientUrl: string;
  apiUrl: string;
}

// Configuration de l'email
const emailConfig: EmailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true', // true pour le port 465, false pour les autres ports
  user: process.env.EMAIL_USER || '',
  pass: process.env.EMAIL_PASS || '',
  contactRecipient: process.env.CONTACT_RECIPIENT_EMAIL || process.env.EMAIL_USER || ''
};

// Configuration principale
const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'votre_secret_jwt_tres_securise',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  email: emailConfig,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:5000',
};

// Validation de la configuration
if (!config.email.user || !config.email.pass) {
  console.warn('Avertissement : Les identifiants de messagerie ne sont pas configurés. L\'envoi d\'emails ne fonctionnera pas.');
}

export { config };
