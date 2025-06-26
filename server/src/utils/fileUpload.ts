import multer from 'multer';
import { Request } from 'express';
import path from 'path';
import fs from 'fs';

// Configuration du stockage des fichiers
export const storage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb) {
    const uploadDir = path.join(__dirname, '../../public/uploads/profiles');
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req: Request, file: Express.Multer.File, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  },
});

// Filtre pour n'accepter que les images
export const imageFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers image sont autorisés !'));
  }
};

// Configuration de multer
const upload = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite à 5MB
  },
});

export const uploadProfileImage = upload.single('profileImage');

export const getProfileImagePath = (filename: string): string => {
  return `/uploads/profiles/${filename}`;
};

export const deleteOldProfileImage = (imagePath: string): void => {
  if (imagePath) {
    const fullPath = path.join(__dirname, '../../public', imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
};
