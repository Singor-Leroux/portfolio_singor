import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Types pour les rôles et statuts
export type UserRole = 'user' | 'admin';
export type UserStatus = 'pending' | 'active' | 'suspended' | 'banned';

// Interface pour le document utilisateur
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: number;
  refreshToken?: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateRefreshToken(): string;
  createPasswordResetToken(): string;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  isAccountLocked(): boolean;
  failedLoginAttempt(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

// Interface pour le modèle utilisateur
interface IUserModel extends Model<IUser> {
  // Méthodes statiques éventuelles
}

const userSchema = new Schema<IUser, IUserModel>({
  name: {
    type: String,
    required: [true, 'Veuillez fournir un nom'],
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères'],
  },
  email: {
    type: String,
    required: [true, 'Veuillez fournir un email'],
    unique: true, // Cela crée automatiquement un index unique
    lowercase: true,
    trim: true,
    match: [
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
      'Veuillez fournir un email valide',
    ],
    index: true, // Définition explicite de l'index pour plus de clarté
  },
  password: {
    type: String,
    required: [true, 'Veuillez fournir un mot de passe'],
    minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'banned'],
    default: 'pending',
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  lastLogin: {
    type: Date,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Number,
  },
  refreshToken: {
    type: String,
    select: false,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
}, {
  timestamps: true,
  toJSON: { virtuals: true, versionKey: false },
  toObject: { virtuals: true, versionKey: false }
});

// Hacher le mot de passe avant de sauvegarder
userSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
  // Ne pas incrémenter passwordChangedAt si c'est un nouvel utilisateur
  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }
  
  next();
});

// Vérifier si le mot de passe a été modifié après l'émission du token JWT
userSchema.methods.changedPasswordAfter = function(JWTTimestamp: number): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Générer un token JWT d'authentification
userSchema.methods.generateAuthToken = function(): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  // Utiliser une durée fixe pour éviter les problèmes de typage
  const expiresIn = '30d';
  
  return jwt.sign(
    { id: this._id.toString(), role: this.role },
    process.env.JWT_SECRET,
    { expiresIn }
  ) as string;
};

// Générer un refresh token JWT
userSchema.methods.generateRefreshToken = function(): string {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
  }
  
  // Utiliser une durée fixe pour éviter les problèmes de typage
  const expiresIn = '90d';
  
  return jwt.sign(
    { id: this._id.toString() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn }
  ) as string;
};

// Créer un token de réinitialisation de mot de passe
userSchema.methods.createPasswordResetToken = function(): string {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  return resetToken;
};

// Vérifier si le compte est verrouillé
userSchema.methods.isAccountLocked = function(): boolean {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Gestion des tentatives de connexion échouées
userSchema.methods.failedLoginAttempt = async function(): Promise<void> {
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCK_TIME = 60 * 60 * 1000; // 1 heure
  
  if (this.lockUntil && this.lockUntil < Date.now()) {
    // Le verrouillage a expiré
    return await this.resetLoginAttempts();
  }
  
  this.loginAttempts += 1;
  
  if (this.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
    this.lockUntil = Date.now() + LOCK_TIME;
  }
  
  await this.save();
};

// Réinitialiser les tentatives de connexion
userSchema.methods.resetLoginAttempts = async function(): Promise<void> {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  await this.save();
};

// Index pour améliorer les performances des requêtes fréquentes
userSchema.index({ 'passwordResetToken': 1, 'passwordResetExpires': 1 });

const User = mongoose.model<IUser, IUserModel>('User', userSchema);

export default User;
