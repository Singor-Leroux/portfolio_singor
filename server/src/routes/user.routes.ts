import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
  getUsers, 
  createUser,
  getUser, 
  updateUser, 
  deleteUser, 
  changeUserRole, 
  toggleUserStatus 
} from '../controllers/user.controller';
import { uploadProfileImage, removeProfileImage } from '../controllers/upload.controller';
import { protect } from '../middleware/auth.middleware';
import { imageFilter } from '../utils/fileUpload';
import { cvFilter } from '../middleware/cvUpload';

const router = Router();

// Toutes protégées
router.use(protect);

// Routes accessibles par tous les utilisateurs authentifiés
router.route('/')
  .get(getUsers)
  .post(protect, createUser); // Ajout de la route POST pour la création d'utilisateur

// Configuration pour les téléchargements de fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadDir: string;
    
    // Déterminer le dossier de destination en fonction du type de fichier
    if (file.fieldname === 'profileImage') {
      uploadDir = path.join(__dirname, '../../public/uploads/profiles');
    } else if (file.fieldname === 'cvFile') {
      uploadDir = path.join(__dirname, '../../public/uploads/cv');
    } else {
      uploadDir = path.join(__dirname, '../../public/uploads/others');
    }
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    let prefix = '';
    
    // Ajouter un préfixe en fonction du type de fichier
    if (file.fieldname === 'profileImage') {
      prefix = 'profile-';
    } else if (file.fieldname === 'cvFile') {
      prefix = 'cv-';
    }
    
    cb(null, prefix + uniqueSuffix + ext);
  }
});

// Configuration pour le téléchargement multiple
const uploadMultipleFiles = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Appliquer le filtre approprié en fonction du type de fichier
    if (file.fieldname === 'profileImage') {
      return imageFilter(req, file, cb);
    } else if (file.fieldname === 'cvFile') {
      return cvFilter(req, file, cb);
    } else {
      // Rejeter les fichiers avec des noms de champ inconnus
      cb(new Error('Type de fichier non pris en charge'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB par fichier
    files: 2 // Maximum 2 fichiers (profil + CV)
  }
}).fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'cvFile', maxCount: 1 }
]);

// Middleware pour gérer plusieurs fichiers
const handleMultipleFiles = (req: any, res: any, next: any) => {
  console.log('=== Début du traitement des fichiers multiples ===');
  
  // Vérifier si c'est une requête multipart
  if (!req.is('multipart/form-data')) {
    console.log('Pas de données multipart, passage au middleware suivant');
    return next();
  }
  
  // Initialiser req.files s'il n'existe pas
  req.files = req.files || {};
  
  // Utiliser le middleware uploadMultipleFiles
  uploadMultipleFiles(req, res, (err: any) => {
    if (err) {
      console.error('Erreur lors du téléchargement des fichiers:', err);
      
      // Gestion des erreurs de taille de fichier
      if (err.code === 'LIMIT_FILE_SIZE') {
        req.fileSizeError = `Un ou plusieurs fichiers sont trop volumineux. La taille maximale autorisée est de 5MB.`;
      } 
      // Gestion des erreurs de type de fichier
      else if (err.message.includes('Seuls les fichiers')) {
        req.fileTypeError = err.message;
      } else {
        // Autre erreur
        return next(err);
      }
      
      // Passer au middleware d'erreur pour gérer les erreurs de fichier
      return next('route');
    }
    
    // Vérifier si des fichiers ont été téléchargés
    if (req.files) {
      console.log('Fichiers reçus avec succès:', req.files);
      
      // S'assurer que req.files a la structure attendue
      if (!req.files['profileImage'] && !req.files['cvFile']) {
        console.log('Aucun fichier valide n\'a été téléchargé');
      } else {
        if (req.files['profileImage']) {
          console.log('Image de profil reçue:', req.files['profileImage'][0]);
        }
        if (req.files['cvFile']) {
          console.log('CV reçu:', req.files['cvFile'][0]);
        }
      }
    } else {
      console.log('Aucun fichier téléchargé');
    }
    
    // Passer au middleware suivant
    next();
  });
};

// Middleware pour gérer les erreurs de téléchargement
const handleUploadErrors = (req: any, res: any, next: any) => {
  console.log('=== Gestion des erreurs de téléchargement ===');
  
  // Vérifier s'il y a des erreurs dans la requête
  const errors = [];
  
  // Vérifier les erreurs de taille de fichier
  if (req.fileSizeError) {
    errors.push(req.fileSizeError);
  }
  
  // Vérifier les erreurs de type de fichier
  if (req.fileTypeError) {
    errors.push(req.fileTypeError);
  }
  
  // S'il y a des erreurs, les renvoyer
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Erreur lors du téléchargement des fichiers',
      errors: errors
    });
  }
  
  // Si tout est OK, passer au middleware suivant
  next();
};

router.route('/:id')
  .get(getUser)
  .put(handleMultipleFiles, updateUser) // Utiliser le middleware personnalisé pour gérer plusieurs fichiers
  .delete(deleteUser);

// Routes admin uniquement
router.route('/:id/role')
  .put(changeUserRole);

router.route('/:id/suspend')
  .put(toggleUserStatus);

// Configuration pour le téléchargement d'une seule image de profil
const uploadSingleProfileImage = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(__dirname, '../../public/uploads/profiles');
      
      // Créer le dossier s'il n'existe pas
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, 'profile-' + uniqueSuffix + ext);
    }
  }),
  fileFilter: imageFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1 // Un seul fichier
  }
}).single('profileImage');

// Routes pour la gestion de l'image de profil
router.route('/upload-profile-image')
  .put(protect, (req, res, next) => {
    uploadSingleProfileImage(req, res, (err: any) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'Fichier trop volumineux. La taille maximale autorisée est de 5MB.'
          });
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: 'Trop de fichiers téléchargés. Un seul fichier est autorisé.'
          });
        } else if (err.message === 'Seuls les fichiers image sont autorisés !') {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || 'Erreur lors du téléchargement de l\'image de profil'
        });
      }
      next();
    });
  }, uploadProfileImage);

router.route('/remove-profile-image')
  .delete(protect, removeProfileImage);

export default router;
