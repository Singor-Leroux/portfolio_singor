import { IUser } from '../models/user.model';
import { Request, Response, NextFunction, RequestHandler } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      file?: any; // Pour les fichiers téléchargés
    }

    interface MulterRequest extends Request {
      file?: Express.Multer.File;
      files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
    }
  }
}

export interface IRequestWithUser extends Request {
  user: IUser;
}

// Déclaration des modules manquants
declare module 'jsonwebtoken';
declare module 'multer';
declare module 'nodemailer';
declare module 'cookie-parser';

export {};
