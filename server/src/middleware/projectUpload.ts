import multer, { FileFilterCallback, Multer } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Définir le chemin du dossier de destination pour les projets
const PROJECT_UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'uploads', 'projects');

// S'assurer que le dossier de destination existe, sinon le créer
if (!fs.existsSync(PROJECT_UPLOAD_DIR)) {
  fs.mkdirSync(PROJECT_UPLOAD_DIR, { recursive: true });
}

// Configuration du stockage pour Multer
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, PROJECT_UPLOAD_DIR);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'project-' + uniqueSuffix + ext);
  },
});

// Filtre pour n'accepter que les fichiers image
const imageFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers image (JPEG, PNG, JPG, WebP) sont autorisés !') as any, false);
  }
};

// Initialiser Multer avec la configuration de stockage et le filtre
const projectUpload = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5MB par fichier
  },
});

export const uploadProjectImage = projectUpload.single('imageFile');
export default projectUpload;
