import { Request, Response } from 'express';
import User from '../models/user.model';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/error.middleware';

/**
 * @desc    Obtenir tous les utilisateurs (pour admin)
 * @route   GET /api/v1/admin/users
 * @access  Private/Admin
 */
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  // Pagination
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const skip = (page - 1) * limit;

  // Filtrage
  const query: any = {};
  if (req.query.role) {
    query.role = req.query.role;
  }
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  // Exécuter la requête
  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  // Calculer la pagination
  const pages = Math.ceil(total / limit);
  const hasMore = page < pages;

  res.status(200).json({
    success: true,
    count: users.length,
    pagination: {
      total,
      pages,
      page,
      limit,
      hasMore,
    },
    data: users,
  });
});

/**
 * @desc    Obtenir un utilisateur par ID (pour admin)
 * @route   GET /api/v1/admin/users/:id
 * @access  Private/Admin
 */
export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select('-password -refreshToken');
  
  if (!user) {
    throw new AppError(`Aucun utilisateur trouvé avec l'ID ${req.params.id}`, 404);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Mettre à jour un utilisateur (pour admin)
 * @route   PUT /api/v1/admin/users/:id
 * @access  Private/Admin
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  // Ne pas permettre la mise à jour du mot de passe ici
  const { password, ...updateData } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password -refreshToken');

  if (!user) {
    throw new AppError(`Aucun utilisateur trouvé avec l'ID ${req.params.id}`, 404);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Supprimer un utilisateur (pour admin)
 * @route   DELETE /api/v1/admin/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  // Empêcher l'auto-suppression
  if (req.user && req.user.id === req.params.id) {
    throw new AppError('Vous ne pouvez pas supprimer votre propre compte depuis cette interface', 400);
  }

  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    throw new AppError(`Aucun utilisateur trouvé avec l'ID ${req.params.id}`, 404);
  }

  res.status(200).json({
    success: true,
    data: {},
  });
});

/**
 * @desc    Mettre à jour le rôle d'un utilisateur (pour admin)
 * @route   PUT /api/v1/admin/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { role } = req.body;
  
  if (!['user', 'admin'].includes(role)) {
    throw new AppError('Rôle invalide. Les rôles valides sont: user, admin', 400);
  }

  // Empêcher la rétrogradation du dernier admin
  if (role !== 'admin' && req.user?.id === req.params.id) {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      throw new AppError('Impossible de retirer les droits administrateur: au moins un administrateur est requis', 400);
    }
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select('-password -refreshToken');

  if (!user) {
    throw new AppError(`Aucun utilisateur trouvé avec l'ID ${req.params.id}`, 404);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});
