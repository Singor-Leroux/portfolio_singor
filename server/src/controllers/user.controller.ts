import { Response } from 'express';
import User, { IUser } from '../models/user.model';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth.middleware';

// @desc    Récupérer tous les utilisateurs (admin)
// @route   GET /api/users
// @access  Privé/Admin
export const getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Vérifier si l'utilisateur est admin
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Non autorisé à accéder à cette ressource',
    });
  }

  const users = await User.find().select('-password -refreshToken');
  
  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc    Récupérer un utilisateur par ID
// @route   GET /api/users/:id
// @access  Privé/Admin
export const getUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Vérifier si l'utilisateur est admin ou s'il accède à son propre profil
  if (req.user?.role !== 'admin' && req.user?.id !== req.params.id) {
    return res.status(403).json({
      success: false,
      message: 'Non autorisé à accéder à cette ressource',
    });
  }

  const user = await User.findById(req.params.id).select('-password -refreshToken');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: `Utilisateur non trouvé avec l'ID ${req.params.id}`,
    });
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Mettre à jour un utilisateur
// @route   PUT /api/users/:id
// @access  Privé/Admin ou utilisateur propriétaire
export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Vérifier si l'utilisateur est admin ou s'il met à jour son propre profil
  if (req.user?.role !== 'admin' && req.user?.id !== req.params.id) {
    return res.status(403).json({
      success: false,
      message: 'Non autorisé à accéder à cette ressource',
    });
  }

  const { name, email, status } = req.body;
  const updateFields: Partial<IUser> = {};

  if (name) updateFields.name = name;
  if (email) updateFields.email = email;
  
  // Seul un admin peut changer le statut
  if (req.user?.role === 'admin' && status) {
    updateFields.status = status;
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    updateFields,
    {
      new: true,
      runValidators: true,
    }
  ).select('-password -refreshToken');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: `Utilisateur non trouvé avec l'ID ${req.params.id}`,
    });
  }


  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Supprimer un utilisateur
// @route   DELETE /api/users/:id
// @access  Privé/Admin
export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Seul un admin peut supprimer un utilisateur
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Non autorisé à effectuer cette action',
    });
  }

  // Empêcher un admin de se supprimer lui-même
  if (req.user?.id === req.params.id) {
    return res.status(400).json({
      success: false,
      message: 'Un administrateur ne peut pas se supprimer lui-même',
    });
  }

  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: `Utilisateur non trouvé avec l'ID ${req.params.id}`,
    });
  }

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Changer le rôle d'un utilisateur (admin uniquement)
// @route   PUT /api/users/:id/role
// @access  Privé/Admin
export const changeUserRole = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Non autorisé à effectuer cette action',
    });
  }

  const { role } = req.body;

  // Vérifier si le rôle est valide
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Rôle invalide. Les rôles valides sont: user, admin',
    });
  }

  // Empêcher de modifier son propre rôle
  if (req.user?.id === req.params.id) {
    return res.status(400).json({
      success: false,
      message: 'Vous ne pouvez pas modifier votre propre rôle',
    });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    {
      new: true,
      runValidators: true,
    }
  ).select('-password -refreshToken');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: `Utilisateur non trouvé avec l'ID ${req.params.id}`,
    });
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Suspendre/réactiver un compte utilisateur (admin uniquement)
// @route   PUT /api/users/:id/suspend
// @access  Privé/Admin
export const toggleUserStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Non autorisé à effectuer cette action',
    });
  }

  // Empêcher de suspendre son propre compte
  if (req.user.id === req.params.id) {
    return res.status(400).json({
      success: false,
      message: 'Vous ne pouvez pas modifier le statut de votre propre compte',
    });
  }

  const user = await User.findById(req.params.id).select('-password -refreshToken');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: `Utilisateur non trouvé avec l'ID ${req.params.id}`,
    });
  }

  // Basculer entre 'active' et 'suspended'
  user.status = user.status === 'active' ? 'suspended' : 'active';
  await user.save();

  res.status(200).json({
    success: true,
    data: user,
    message: `Compte utilisateur ${user.status === 'active' ? 'réactivé' : 'suspendu'} avec succès`,
  });
});
