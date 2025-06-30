import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User, { IUser } from '../models/user.model';

// Interface pour le payload JWT personnalisé
interface ICustomJwtPayload extends JwtPayload {
  id: string;
  role: string;
}

// Interface pour étendre l'objet Request d'Express
export interface AuthRequest extends Request {
  user?: IUser;
  [key: string]: any;
}

// Protéger les routes
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Vérifier le token dans les en-têtes
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // Vérifier le token dans les cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Vérifier si le token existe
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Non autorisé, token manquant',
    });
  }

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as ICustomJwtPayload;

    // Récupérer l'utilisateur à partir de l'ID dans le token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé avec ce token',
      });
    }

    // Ajouter l'utilisateur à l'objet request
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      success: false,
      message: 'Non autorisé, token invalide',
    });
  }
};

// Autoriser des rôles spécifiques
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Le rôle ${req.user.role} n'est pas autorisé à accéder à cette ressource`,
      });
    }
    next();
  };
};

// Vérifier la propriété (l'utilisateur est le propriétaire de la ressource)
export const checkOwnership = (model: any, paramName = 'id') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const resource = await model.findById(req.params[paramName]);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Ressource non trouvée',
        });
      }

      // Vérifier si l'utilisateur est le propriétaire ou un admin
      if (
        resource.user.toString() !== req.user?.id &&
        req.user?.role !== 'admin'
      ) {
        return res.status(403).json({
          success: false,
          message: 'Non autorisé à accéder à cette ressource',
        });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification de la propriété',
      });
    }
  };
};

// Vérifier les permissions
export const checkPermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Implémentez votre logique de vérification des permissions ici
    // Par exemple, vérifier dans la base de données si l'utilisateur a la permission requise
    
    // Pour l'instant, nous allons simplement vérifier si l'utilisateur est admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `Permission refusée: ${permission} requise`,
      });
    }
    
    next();
  };
};
