import { NextFunction } from 'express';
import { IRequestWithUser, IResponse } from '../types/express';
import { validationResult } from 'express-validator';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import User from '../models/user.model';
import { IUser } from '../models/user.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ErrorResponse } from '../utils/errorResponse.utils';
import { sendConfirmationEmail } from '../utils/email.utils';
import { 
  USER_STATUS, 
  TOKEN_TYPES, 
  EMAIL_VERIFICATION_EXPIRES_IN,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
} from '../constants/auth.constants';

// Interface pour la réponse JWT
export interface IAuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    title: string;
    email: string;
    phoneNumber?: string;
    address?: string;
    socialLinks?: {
      github?: string;
      linkedin?: string;
      twitter?: string;
    };
    role: string;
  };
  message?: string;
}

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public
interface RegisterBody {
  firstName: string;
  lastName: string;
  title: string;
  about: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
}

export const register = asyncHandler(async (req: IRequestWithUser & { body: RegisterBody }, res: IResponse, next: NextFunction) => {
  // Validation des données
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array({ onlyFirstError: true }),
    });
  }

  const { 
    firstName, 
    lastName, 
    title, 
    about, 
    email, 
    password, 
    phoneNumber, 
    address, 
    github, 
    linkedin, 
    twitter 
  } = req.body;

  // Vérifier si l'utilisateur existe déjà
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: ERROR_MESSAGES.USER_EXISTS,
    });
  }

  // Créer un jeton de vérification d'email
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  const emailVerificationExpires = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRES_IN);

  // Créer l'utilisateur avec le statut 'pending' et le jeton de vérification
  const user = await User.create({
    firstName,
    lastName,
    title,
    about,
    email,
    password,
    phoneNumber,
    address,
    socialLinks: {
      github,
      linkedin,
      twitter
    },
    role: 'user',
    status: USER_STATUS.PENDING,
    emailVerificationToken,
    emailVerificationExpires,
  });

  // Envoyer l'email de confirmation
  const emailSent = await sendConfirmationEmail({
        to: user.email,
        name: user.firstName,
        token: emailVerificationToken
      });

  if (!emailSent) {
    console.error('Failed to send confirmation email to:', user.email);
    // Ne pas renvoyer d'erreur à l'utilisateur pour des raisons de sécurité
  }

  // Répondre avec succès (sans token d'accès)
  res.status(201).json({
    success: true,
    message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS,
    data: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      title: user.title,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: user.address,
      socialLinks: user.socialLinks,
      status: user.status,
      isEmailVerified: user.isEmailVerified
    }
  });
});

// @desc    Confirmer l'email d'un utilisateur
// @route   GET /api/auth/confirm-email
// @access  Public
export const confirmEmail = asyncHandler(async (req: IRequestWithUser, res: IResponse) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token de vérification manquant',
    });
  }

  // Trouver l'utilisateur avec ce token non expiré
  const user = await User.findOne({
    emailVerificationToken: token.toString(),
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Lien de vérification invalide ou expiré',
    });
  }

  // Mettre à jour l'utilisateur
  user.status = USER_STATUS.ACTIVE;
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  
  await user.save({ validateBeforeSave: false });

  // Rediriger vers la page de connexion avec un message de succès
  const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  return res.redirect(`${frontendUrl}/login?verified=true`);
});

// @desc    Renvoyer l'email de confirmation
// @route   POST /api/auth/resend-verification-email
// @access  Public
interface ResendVerificationEmailBody {
  email: string;
}

export const resendVerificationEmail = asyncHandler(async (req: IRequestWithUser & { body: ResendVerificationEmailBody }, res: IResponse, next: NextFunction) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorResponse('Veuillez fournir une adresse email', 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Aucun utilisateur trouvé avec cette adresse email',
    });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      message: 'Cet email a déjà été vérifié',
    });
  }

  // Créer un nouveau jeton de vérification
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  const emailVerificationExpires = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRES_IN);

  // Mettre à jour l'utilisateur avec le nouveau jeton
  user.emailVerificationToken = emailVerificationToken;
  user.emailVerificationExpires = emailVerificationExpires;
  await user.save({ validateBeforeSave: false });

  // Envoyer l'email de confirmation
  const emailSent = await sendConfirmationEmail({
        to: user.email,
        name: user.firstName,
        token: emailVerificationToken
      });

  if (!emailSent) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de l\'email de confirmation',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Email de vérification renvoyé avec succès',
  });
});

// @desc    Connexion d'un utilisateur
// @route   POST /api/auth/login
// @access  Public
interface LoginBody {
  email: string;
  password: string;
}

export const login = asyncHandler(async (req: IRequestWithUser & { body: LoginBody }, res: IResponse, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array({ onlyFirstError: true }),
    });
  }

  const { email, password } = req.body;

  // Vérifier l'utilisateur
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
    });
  }

  // Vérifier le statut du compte
  if (user.status === USER_STATUS.SUSPENDED) {
    return res.status(403).json({
      success: false,
      message: ERROR_MESSAGES.ACCOUNT_SUSPENDED,
    });
  }

  if (user.status === USER_STATUS.BANNED) {
    return res.status(403).json({
      success: false,
      message: ERROR_MESSAGES.ACCOUNT_BANNED,
    });
  }

  // Vérifier si l'email est vérifié
  // if (!user.isEmailVerified) {
  //   return res.status(403).json({
  //     success: false,
  //     message: ERROR_MESSAGES.EMAIL_VERIFICATION_REQUIRED,
  //     requiresVerification: true,
  //     email: user.email
  //   });
  // }

  // Vérifier le mot de passe
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    // Enregistrer la tentative de connexion échouée
    await user.failedLoginAttempt();
    
    return res.status(401).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
    });
  }

  // Réinitialiser les tentatives de connexion en cas de succès
  await user.resetLoginAttempts();

  // Mettre à jour la date de dernière connexion
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Appeler sendTokenResponse
  return sendTokenResponse(user, 200, res);
});

// @desc    Récupérer le profil de l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Privé
export const getMe = asyncHandler(async (req: IRequestWithUser, res: IResponse) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Non autorisé, utilisateur non authentifié',
    });
  }

  const user = await User.findById(req.user.id);
  
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Mettre à jour les détails de l'utilisateur
// @route   PUT /api/auth/updatedetails
// @access  Privé
export const updateDetails = asyncHandler(async (req: IRequestWithUser, res: IResponse) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Non autorisé, utilisateur non authentifié',
    });
  }

  const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      title: req.body.title,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
      socialLinks: {
        github: req.body.github,
        linkedin: req.body.linkedin,
        twitter: req.body.twitter
      }
    };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Mettre à jour le mot de passe
// @route   PUT /api/auth/updatepassword
// @access  Privé
interface UpdatePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export const updatePassword = asyncHandler(async (req: IRequestWithUser & { body: UpdatePasswordBody }, res: IResponse, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Non autorisé, utilisateur non authentifié',
    });
  }

  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Utilisateur non trouvé',
    });
  }

  // Vérifier le mot de passe actuel
  if (!(await user.comparePassword(req.body.currentPassword))) {
    return res.status(401).json({
      success: false,
      message: 'Mot de passe actuel incorrect',
    });
  }

  user.password = req.body.newPassword;
  await user.save();

  return sendTokenResponse(user, 200, res);
});

// @desc    Mot de passe oublié
// @route   POST /api/auth/forgotpassword
// @access  Public
interface ForgotPasswordQuery {
  token?: string;
}

export const forgotPassword = asyncHandler(async (req: IRequestWithUser & { query: ForgotPasswordQuery }, res: IResponse, next: NextFunction) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token de vérification manquant',
    });
  }

  // Trouver l'utilisateur avec ce token non expiré
  const user = await User.findOne({
    emailVerificationToken: token.toString(),
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Lien de vérification invalide ou expiré',
    });
  }

  // Mettre à jour l'utilisateur
  user.status = USER_STATUS.ACTIVE;
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  
  await user.save({ validateBeforeSave: false });

  // Rediriger vers la page de connexion avec un message de succès
  const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  return res.redirect(`${frontendUrl}/login?verified=true`);
});

// Helper pour envoyer la réponse avec le token
const sendTokenResponse = (user: IUser, statusCode: number, res: IResponse) => {
  // Créer le token
  const token = user.generateAuthToken();

  const isProduction = process.env.NODE_ENV === 'production';
  
  // Configuration de base du cookie
  const cookieOptions: any = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE ? parseInt(process.env.JWT_COOKIE_EXPIRE) : 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: isProduction,
    path: '/',
  };

  // Configuration spécifique pour la production
  if (isProduction) {
    cookieOptions.sameSite = 'none' as const;
    cookieOptions.domain = '.votredomaine.com';
  } else {
    // Configuration pour le développement
    cookieOptions.sameSite = 'lax' as const;
  }

  // Envoyer la réponse avec le token dans le cookie et le corps de la réponse
  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        title: user.title,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        cvUrl: user.cvUrl,
        socialLinks: user.socialLinks,
        role: user.role,
      },
    });
};

// @desc    Déconnecter l'utilisateur / effacer le cookie
// @route   GET /api/auth/logout
// @access  Privé
export const logout = (req: IRequestWithUser, res: IResponse, next: NextFunction): void => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Configuration de base du cookie
  const cookieOptions: any = {
    expires: new Date(Date.now() + 10 * 1000), // Expire dans 10 secondes
    httpOnly: true,
    secure: isProduction,
    path: '/',
  };

  // Configuration spécifique pour la production
  if (isProduction) {
    cookieOptions.sameSite = 'none' as const;
    cookieOptions.domain = '.votredomaine.com';
  } else {
    // Configuration pour le développement
    cookieOptions.sameSite = 'lax' as const;
  }

  res.cookie('token', 'none', cookieOptions);
  
  // Supprimer également le token côté client via le header Set-Cookie
  res.setHeader('Clear-Site-Data', '"cookies"');

  res.status(200).json({
    success: true,
    data: {},
    message: 'Déconnexion réussie',
  });
};
