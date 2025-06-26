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
const PORT = process.env.PORT || 5000;

// Configuration CORS pour WebSocket et API
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000', // React dev server
  'http://localhost:5000', // Serveur API
  'http://localhost:5001', // Admin
  'http://localhost:5002', // Client
  'http://127.0.0.1:5002', // Client (alternative)
  'http://localhost:5002',  // Client (sans /)
  'http://127.0.0.1:5002'   // Client (sans /, alternative)
];

// Fonction pour normaliser les origines
const normalizeOrigin = (origin: string): string => {
  try {
    const url = new URL(origin);
    return `${url.protocol}//${url.host}`;
  } catch (e) {
    return origin;
  }
};

// Fonction pour vérifier si une origine est autorisée
const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return false;
  
  // Normaliser l'origine pour la comparaison
  const normalizedOrigin = normalizeOrigin(origin);
  
  // Vérifier si l'origine est dans la liste autorisée
  return allowedOrigins.some(allowedOrigin => {
    try {
      const normalizedAllowed = normalizeOrigin(allowedOrigin);
      return normalizedOrigin === normalizedAllowed;
    } catch (e) {
      return false;
    }
  });
};

// Configuration CORS de base réutilisable
const corsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Autoriser les requêtes sans origine (comme les applications mobiles, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Vérifier si l'origine est autorisée
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(`Origin non autorisée: ${origin}`);
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true, // Important: permet d'envoyer les cookies d'authentification
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Credentials',
    'Access-Control-Allow-Headers',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'X-Forwarded-For',
    'X-CSRF-Token',
    'X-Real-IP',
    'X-Forwarded-Proto',
    'X-Forwarded-Host',
    'X-Forwarded-Port',
    'X-Forwarded-Server',
    'X-Forwarded-User',
    'X-Forwarded-Prefix',
    'X-Forwarded-Path',
    'X-Forwarded-Uri',
    'X-Forwarded-For',
    'X-Forwarded-Proto',
    'X-Forwarded-Host',
    'X-Forwarded-Port',
    'X-Forwarded-Server',
    'X-Forwarded-User',
    'X-Forwarded-Prefix',
    'X-Forwarded-Path',
    'X-Forwarded-Uri',
    'Date',
    'X-Api-Version',
    'X-CSRF-Token',
    'X-HTTP-Method-Override',
    'Set-Cookie',
    'Cookie'
  ],
  // Exposer les en-têtes nécessaires
  exposedHeaders: [
    'Content-Range',
    'X-Total-Count',
    'Authorization',
    'Content-Disposition',
    'Set-Cookie',
    'Clear-Site-Data'
  ]
};

// Handle preflight requests
app.options('*', cors(corsOptions));

// Configuration CORS pour l'application
app.use(cors(corsOptions));

// Middleware pour parser le JSON
app.use(express.json({ limit: '10kb' }));

// Middleware pour parser les données de formulaire
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Middleware pour les cookies
app.use(cookieParser());

// Middleware de sécurité Helmet
app.use(helmet());

// Rate limiting - configuration plus permissive pour le développement
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Limite plus élevée en développement
  message: { 
    success: false, 
    message: 'Trop de requêtes depuis cette adresse IP, veuillez réessayer plus tard.' 
  },
  // Ne pas compter les échecs de connexion WebSocket
  skipFailedRequests: true,
  // Ignorer les requêtes de prévol (OPTIONS)
  skip: (req) => req.method === 'OPTIONS'
});

// Appliquer le rate limiting uniquement sur les routes API
app.use('/api', limiter);

// Middleware pour ajouter les en-têtes CORS aux fichiers statiques
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Si c'est une requête OPTIONS, répondre immédiatement
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Servir les fichiers statiques du dossier 'public'
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads'), {
  setHeaders: (res) => {
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

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
