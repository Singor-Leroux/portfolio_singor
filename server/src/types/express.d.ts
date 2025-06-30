// Import des types Express de base
import { Request as ExpressRequest, Response as ExpressResponse, NextFunction, RequestHandler } from 'express';
import { IUser } from '../models/user.model';

// Ré-export des types de base
export { Request, Response, NextFunction, RequestHandler } from 'express';

// Déclaration des modules manquants
declare module 'jsonwebtoken' {
  export interface JwtPayload {
    id: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
  }
}

declare module 'multer' {
  interface Multer {
    single(fieldname: string): RequestHandler;
    array(fieldName: string, maxCount?: number): RequestHandler;
    fields(fields: { name: string; maxCount?: number }[]): RequestHandler;
    none(): RequestHandler;
    any(): RequestHandler;
  }
}

declare module 'nodemailer' {
  // Déclarations de base pour nodemailer
}

declare module 'cookie-parser' {
  interface CookieParseOptions {
    decode?(val: string): string;
  }
  
  interface CookieParseFunction {
    (cookie: string, options?: CookieParseOptions): { [key: string]: string };
  }
  
  const cookieParser: {
    (secret?: string | string[], options?: CookieParseOptions): RequestHandler;
    JSONCookie(jsonCookie: string): any;
    JSONCookies(jsonCookies: { [key: string]: string }): { [key: string]: any };
    signedCookie(cookie: string, secret: string | string[]): string | false;
    signedCookies(cookies: { [key: string]: string }, secret: string | string[]): { [key: string]: string };
  };
  
  export = cookieParser;
}

declare global {
  namespace Express {
    // Étendre l'interface Request d'Express
    interface Request {
      user?: IUser;
      file?: Express.Multer.File;
      files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
    }

    // Interface pour les requêtes avec fichiers
    interface MulterRequest extends Request {
      file?: Express.Multer.File;
      files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
    }
  }
}

import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';

// Extension de l'interface Request d'Express
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      [key: string]: any;
    }
  }
}

// Interface pour les requêtes avec utilisateur authentifié
export interface IRequestWithUser extends ExpressRequest {
  user?: IUser;
  body: any;
  query: any;
  params: any;
  file?: Express.Multer.File;
  files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
}

// Interface pour les réponses
export interface IResponse extends ExpressResponse {
  [key: string]: any;
}

// Déclaration des modules
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      file?: any;
      files?: any;
    }
  }
}

export {};
