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
  if (!origin) return true;
  
  // Normaliser l'origine de la requête
  const normalizedOrigin = normalizeOrigin(origin);
  
  // Vérifier si l'origine est dans la liste des origines autorisées
  const isAllowed = allowedOrigins.some(allowedOrigin => {
    try {
      return normalizeOrigin(allowedOrigin) === normalizedOrigin;
    } catch (e) {
      console.warn(`Erreur lors de la normalisation de l'origine: ${allowedOrigin}`, e);
      return false;
    }
  });
  
  if (!isAllowed) {
    console.warn(`Origine non autorisée: ${origin} (normalisée: ${normalizedOrigin})`);
  }
  
  return isAllowed;
};

// Configuration CORS de base réutilisable
const corsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Autoriser les requêtes sans origine (comme les applications mobiles ou Postman)
    if (!origin) {
      console.log('Requête sans origine (peut provenir d\'une application mobile ou Postman)');
      return callback(null, true);
    }
    
    if (!isOriginAllowed(origin)) {
      const msg = `Cette origine ${origin} n'est pas autorisée par CORS`;
      console.warn(msg);
      return callback(new Error(msg), false);
    }
    
    console.log(`Origine autorisée: ${origin}`);
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'X-Request-Id',
    'Accept',
    'Accept-Version',
    'Content-Length',
    'Content-MD5',
    'Content-Type',
    'Date',
    'X-Api-Version',
    'X-CSRF-Token',
    'X-HTTP-Method-Override'
  ],
  credentials: true,
  exposedHeaders: [
    'Content-Range', 
    'X-Total-Count',
    'Authorization',
    'Content-Disposition'
  ],
  optionsSuccessStatus: 204, // Répondre avec 204 No Content pour les requêtes OPTIONS
  preflightContinue: false,
  maxAge: 600 // Durée de mise en cache des pré-vérifications CORS en secondes
};

const io = new Server(server, {
  cors: corsOptions,
  // Configuration supplémentaire pour éviter les problèmes de connexion
  pingTimeout: 60000,
  pingInterval: 25000,
  // Forcer l'utilisation de WebSocket uniquement
  transports: ['websocket']
});

// Gestion des connexions WebSocket
io.on('connection', (socket: Socket) => {
  console.log('Nouveau client connecté');
  
  // Exemple d'événement personnalisé
  socket.on('joinRoom', (room: string) => {
    socket.join(room);
    console.log(`Client rejoint la salle: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('Client déconnecté');
  });

  // Gestion des erreurs
  socket.on('error', (error: Error) => {
    console.error('Erreur WebSocket:', error);
  });
});

// Connexion à la base de données
connectDB();

// Configuration des limites de taille pour les requêtes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Middleware de sécurité
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Configuration CORS pour les requêtes HTTP
app.use(cors(corsOptions));

// Ajouter l'instance io à l'objet app pour y accéder dans les contrôleurs
app.set('io', io);

// Middleware pour les cookies
app.use(cookieParser());

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

// Servir les fichiers statiques du dossier 'public'
// Par exemple, une image dans public/uploads/image.jpg sera accessible via /uploads/image.jpg
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

// Routes de l'API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/skills', skillRoutes);
app.use('/api/v1/experiences', experienceRoutes);     // Montage des routes d'expériences
app.use('/api/v1/educations', educationRoutes);       // Montage des routes d'éducation
app.use('/api/v1/certifications', certificationRoutes); // Montage des routes de certifications
app.use('/api/v1/projects', projectRoutes);           // Montage des routes de projets
app.use('/api/v1/users', userRoutes);                 // Montage des routes utilisateur

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

// Démarrer le serveur
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`WebSocket server is running on ws://localhost:${PORT}`);
});

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