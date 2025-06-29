// server/src/index.ts
import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import path from 'path';

// Configuration des variables d'environnement
dotenv.config();

// Importations des routes
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import skillRoutes from './routes/skill.routes';
import experienceRoutes from './routes/experience.routes'; // Import des routes d'expériences
import educationRoutes from './routes/education.routes';   // Import des routes d'éducation
import certificationRoutes from './routes/certification.routes'; // Import des routes de certifications
import projectRoutes from './routes/project.routes'; // Import des routes de projets
import userRoutes from './routes/user.routes'; // Import des routes utilisateur
import contactRoutes from './routes/contact.routes'; // Import des routes de contact

// Importations des middlewares
import { globalErrorHandler, notFoundHandler } from './middleware/error.middleware';

// Importation de la connexion à la base de données
import connectDB from './config/db';

// Initialisation de l'application Express
const app = express();
const server = createServer(app);

// Configuration du port
const DEFAULT_PORT = 5000;
let PORT: number;

try {
  PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : DEFAULT_PORT;
  if (isNaN(PORT) || PORT < 1 || PORT > 65535) {
    console.warn(`Port invalide: ${process.env.PORT}, utilisation du port par défaut ${DEFAULT_PORT}`);
    PORT = DEFAULT_PORT;
  }
} catch (error) {
  console.error('Erreur lors de la configuration du port:', error);
  PORT = DEFAULT_PORT;
}

// Configuration du trust proxy pour Render
app.set('trust proxy', 1); // Fait confiance au premier proxy

// Configuration CORS
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000', // React dev server
  'http://localhost:5000', // Serveur API
  'http://localhost:5001', // Admin
  'http://localhost:5002', // Client
  'http://127.0.0.1:5002', // Client (alternative)
  'https://portfolio-leroux.netlify.app', // Production frontend
  'https://portfolio-singor-backend.onrender.com', // Backend
  'https://portfolio-leroux.netlify.app' // Production frontend (sans www)
];

// Middleware CORS personnalisé
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Vérifier si l'origine est autorisée
  if (process.env.NODE_ENV === 'production') {
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  } else {
    // En développement, accepter toutes les origines
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, X-Access-Token, X-Forwarded-For, X-Forwarded-Proto, X-Forwarded-Host, X-Forwarded-Port, X-Forwarded-Server, X-Forwarded-User, X-Forwarded-Prefix, X-Forwarded-Path, X-Forwarded-Uri, X-Api-Version, X-CSRF-Token, X-HTTP-Method-Override, Set-Cookie, Cookie');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, X-Total-Count, Authorization, Content-Disposition, Set-Cookie, Clear-Site-Data');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Répondre immédiatement aux requêtes OPTIONS (prévol)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Middleware pour parser le JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Gestionnaire pour favicon.ico
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Middleware pour les cookies
app.use(cookieParser());

// Middleware de sécurité Helmet
app.use(helmet());

// Rate limiting - configuration plus permissive pour le développement
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limite chaque IP à 1000 requêtes par fenêtre
  message: 'Trop de requêtes depuis cette adresse IP, veuillez réessayer plus tard',
  standardHeaders: true, // Renvoie les informations de limite de taux dans les en-têtes `RateLimit-*`
  legacyHeaders: false, // Désactive les en-têtes `X-RateLimit-*`
  skipFailedRequests: true,
  // Ignorer les requêtes de prévol (OPTIONS) et favicon.ico
  skip: (req) => req.method === 'OPTIONS' || req.path === '/favicon.ico',
  // Utiliser l'en-tête X-Forwarded-For derrière un proxy
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || 'unknown';
  }
});

// Appliquer le rate limiting uniquement sur les routes API
app.use('/api', limiter);

// Middleware pour gérer les en-têtes CORS de manière plus flexible
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (origin) {
    // En développement, on accepte toutes les origines
    if (process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Access-Token');
      res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type, X-Total-Count');
      res.header('Access-Control-Max-Age', '86400');
    }
  }

  // Répondre immédiatement aux requêtes OPTIONS (prévol)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Middleware spécifique pour les fichiers statiques
app.use('/uploads', (req, res, next) => {
  const origin = req.headers.origin;
  
  if (origin) {
    // En développement, on accepte toutes les origines
    if (process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
    }
  }
  
  next();
});

// Servir les fichiers statiques du dossier 'public'
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads'), {
  setHeaders: (res) => {
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Route racine
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Bienvenue sur l\'API de Portfolio',
    documentation: 'https://github.com/Singor-Leroux/portfolio_singor',
    api_endpoints: {
      auth: '/api/v1/auth',
      admin: '/api/v1/admin',
      skills: '/api/v1/skills',
      projects: '/api/v1/projects',
      experiences: '/api/v1/experiences',
      education: '/api/v1/education',
      certifications: '/api/v1/certifications',
      contact: '/api/v1/contact'
    }
  });
});

// Routes de l'API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/skills', skillRoutes);
app.use('/api/v1/experiences', experienceRoutes);     // Montage des routes d'expériences
app.use('/api/v1/educations', educationRoutes);       // Montage des routes d'éducation
app.use('/api/v1/certifications', certificationRoutes); // Montage des routes de certifications
app.use('/api/v1/projects', projectRoutes);           // Montage des routes de projets
app.use('/api/v1/users', userRoutes);                 // Montage des routes utilisateur
app.use('/api/contact', contactRoutes);               // Montage des routes de contact

// Route de test
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    status: 'online',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Gestion des routes non trouvées
app.all('*', notFoundHandler);

// Middleware de gestion des erreurs global
app.use(globalErrorHandler);

// Connect to MongoDB and start the server
const startServer = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected successfully');
    
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`WebSocket server is running on ws://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Gestion des rejets de promesses non gérés
process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Gestion des exceptions non capturées
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

export default app;
