import { Request, Response, NextFunction } from 'express';
import { MongoServerError } from 'mongodb';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { Error as MongooseError } from 'mongoose';
import { ValidationError as ExpressValidationError } from 'express-validator';

// Interface pour les erreurs personnalisées
class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Classe pour les erreurs 400 (Bad Request)
class BadRequestError extends AppError {
  constructor(message = 'Requête invalide') {
    super(message, 400);
  }
}

// Classe pour les erreurs 401 (Unauthorized)
class UnauthorizedError extends AppError {
  constructor(message = 'Non autorisé') {
    super(message, 401);
  }
}

// Classe pour les erreurs 403 (Forbidden)
class ForbiddenError extends AppError {
  constructor(message = 'Accès refusé') {
    super(message, 403);
  }
}

// Classe pour les erreurs 404 (Not Found)
class NotFoundError extends AppError {
  constructor(message = 'Ressource non trouvée') {
    super(message, 404);
  }
}

// Classe pour les erreurs 409 (Conflict)
class ConflictError extends AppError {
  constructor(message = 'Conflit de données') {
    super(message, 409);
  }
}

// Classe pour les erreurs 422 (Unprocessable Entity)
class ValidationError extends AppError {
  errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]> | string) {
    super('Erreur de validation', 422);
    this.errors = typeof errors === 'string' ? { message: [errors] } : errors;
  }
}

// Gestionnaire d'erreurs global
const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Définir les valeurs par défaut
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Journalisation de l'erreur en développement
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR 💥', {
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }

  // Gestion des erreurs spécifiques
  // Erreur de validation Mongoose
  if (err instanceof MongooseError.ValidationError) {
    const errors: Record<string, string[]> = {};
    Object.values(err.errors).forEach((el) => {
      errors[el.path as string] = [el.message];
    });
    error = new ValidationError(errors);
  }

  // Erreur de duplication de clé MongoDB
  else if (err.code === 11000) {
    const value = (err as MongoServerError).keyValue;
    const message = `La valeur '${Object.values(value)[0]}' existe déjà pour le champ '${Object.keys(value)[0]}'`;
    error = new ConflictError(message);
  }

  // Erreur de token JWT invalide
  else if (err instanceof JsonWebTokenError) {
    error = new UnauthorizedError('Token invalide');
  }

  // Erreur de token JWT expiré
  else if (err instanceof TokenExpiredError) {
    error = new UnauthorizedError('Token expiré, veuillez vous reconnecter');
  }

  // Erreur de validation express-validator
  else if (err instanceof Array && err[0]?.msg?.param) {
    const errors: Record<string, string[]> = {};
    err.forEach((e: any) => {
      if (!errors[e.param]) {
        errors[e.param] = [];
      }
      errors[e.param].push(e.msg);
    });
    error = new ValidationError(errors);
  }

  // Réponse d'erreur
  const response: any = {
    success: false,
    status: error.status,
    message: error.message || 'Une erreur est survenue',
  };

  // Ajouter les erreurs de validation si elles existent
  if (error instanceof ValidationError) {
    response.errors = error.errors;
  }

  // Ajouter la stack trace en développement
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  // Envoyer la réponse
  res.status(error.statusCode || 500).json(response);
};

// Middleware pour les routes non trouvées
const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError(`Impossible de trouver ${req.originalUrl} sur ce serveur`));
};

export {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  globalErrorHandler,
  notFoundHandler,
};
