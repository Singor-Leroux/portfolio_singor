import multer from 'multer';
import { Request } from 'express';
import path from 'path';
import fs from 'fs';

// Configuration du stockage pour les CV
export const storage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb) {
    const uploadDir = path.join(__dirname, '../../public/uploads/cv');
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req: Request, file: Express.Multer.File, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'cv-' + uniqueSuffix + ext);
  },
});

// Filtre pour n'accepter que les fichiers PDF
export const cvFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF sont autorisés pour le CV !'));
  }
};

// Configuration de multer pour les CV
export const uploadCV = multer({
  storage: storage,
  fileFilter: cvFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite à 5MB
  },
});

export const getCVPath = (filename: string): string => {
  return `/uploads/cv/${filename}`;
};

export const deleteOldCV = (cvPath: string): void => {
  if (cvPath) {
    const filename = cvPath.split('/').pop();
    if (filename) {
      const filePath = path.join(__dirname, '../../public/uploads/cv', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }
};
