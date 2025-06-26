import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import User from '../models/user.model';
import { asyncHandler } from '../utils/asyncHandler';
import { deleteOldProfileImage, getProfileImagePath } from '../utils/fileUpload';

// @desc    Téléverser une image de profil
// @route   PUT /api/users/upload-profile-image
// @access  Privé
export const uploadProfileImage = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Aucun fichier téléversé',
    });
  }

  // Récupérer l'utilisateur actuel
  const user = await User.findById(req.user?._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Utilisateur non trouvé',
    });
  }

  // Supprimer l'ancienne image si elle existe
  if (user.profileImage) {
    deleteOldProfileImage(user.profileImage);
  }

  // Mettre à jour le chemin de l'image de profil
  const imagePath = getProfileImagePath(req.file.filename);
  user.profileImage = imagePath;
  
  await user.save();

  // Ne pas renvoyer les informations sensibles
  const { password, refreshToken, ...userResponse } = user.toObject();

  res.status(200).json({
    success: true,
    message: 'Image de profil mise à jour avec succès',
    data: {
      profileImage: user.profileImage,
      user: userResponse,
    },
  });
});

// @desc    Supprimer l'image de profil
// @route   DELETE /api/users/remove-profile-image
// @access  Privé
export const removeProfileImage = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Récupérer l'utilisateur actuel
  const user = await User.findById(req.user?._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Utilisateur non trouvé',
    });
  }

  // Supprimer l'image si elle existe
  if (user.profileImage) {
    deleteOldProfileImage(user.profileImage);
    user.profileImage = '';
    await user.save();
  }

  // Ne pas renvoyer les informations sensibles
  const { password, refreshToken, ...userResponse } = user.toObject();

  res.status(200).json({
    success: true,
    message: 'Image de profil supprimée avec succès',
    data: userResponse,
  });
});
