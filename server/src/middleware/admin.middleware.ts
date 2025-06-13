import { Response, NextFunction } from 'express';
import { ForbiddenError } from './error.middleware';
import { AuthRequest } from './auth.middleware';

/**
 * Middleware pour vérifier si l'utilisateur est administrateur
 * Doit être utilisé après le middleware d'authentification
 */
export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Vérifier si l'utilisateur est authentifié et a le rôle admin
  if (!req.user || req.user.role !== 'admin') {
    return next(new ForbiddenError('Accès réservé aux administrateurs'));
  }
  next();
};

/**
 * Middleware pour vérifier les permissions d'administrateur ou de propriétaire
 * Permet à un admin d'accéder à toutes les ressources, ou à un utilisateur d'accéder à ses propres ressources
 */
export const adminOrOwner = (resourceOwnerId: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Si l'utilisateur est admin, il a accès
    if (req.user?.role === 'admin') {
      return next();
    }
    
    // Si l'utilisateur est le propriétaire de la ressource, il a accès
    if (req.user?.id === resourceOwnerId) {
      return next();
    }
    
    // Sinon, accès refusé
    next(new ForbiddenError('Vous n\'êtes pas autorisé à accéder à cette ressource'));
  };
};
