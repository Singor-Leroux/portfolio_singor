import { Response } from 'express';
import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/user.model';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth.middleware';

// @desc    Récupérer tous les utilisateurs (admin)
// @route   GET /api/users
// @access  Privé/Admin
// @desc    Créer un nouvel utilisateur (admin uniquement)
// @route   POST /api/users
// @access  Privé/Admin
export const createUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Vérifier si l'utilisateur est admin
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Non autorisé à effectuer cette action',
    });
  }

  const { name, email, password, role = 'user', firstName, lastName, title, about = '' } = req.body;

  // Vérifier si l'utilisateur existe déjà
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({
      success: false,
      message: 'Un utilisateur avec cet email existe déjà',
    });
  }

  // Hasher le mot de passe
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Créer l'utilisateur avec des valeurs par défaut pour les champs optionnels
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    firstName,
    lastName,
    title: title || 'Utilisateur',
    about: about || '',
    isEmailVerified: false,
    status: 'active',
  });

  // Ne pas renvoyer les informations sensibles dans la réponse
  const { password: _, refreshToken: __, ...userResponse } = user.toObject();

  res.status(201).json({
    success: true,
    data: userResponse,
  });
});

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
  console.log('=== Début de la mise à jour utilisateur ===');
  console.log('ID utilisateur à mettre à jour:', req.params.id);
  console.log('Données reçues:', JSON.stringify(req.body, null, 2));
  console.log('Fichiers reçus:', req.file ? 'Oui' : 'Non');
  console.log('Utilisateur effectuant la requête:', req.user?.id, 'Rôle:', req.user?.role);
  
  // Vérifier si l'utilisateur est admin ou s'il met à jour son propre profil
  if (req.user?.role !== 'admin' && req.user?.id !== req.params.id) {
    console.log('Accès refusé: utilisateur non autorisé');
    return res.status(403).json({
      success: false,
      message: 'Non autorisé à accéder à cette ressource',
    });
  }

  const { name, email, firstName, lastName, title, about, role, password, status, socialLinks, profileImage, phoneNumber, address, cvUrl } = req.body;
  const updateFields: Partial<IUser> = {};

  // Mettre à jour les champs de base
  if (name) updateFields.name = name;
  
  // Mettre à jour les liens de réseaux sociaux s'ils sont fournis
  if (socialLinks) {
    // Initialiser l'objet socialLinks s'il n'existe pas
    if (!updateFields.socialLinks) {
      updateFields.socialLinks = {};
    }
    
    // Mettre à jour chaque lien social fourni
    if (socialLinks.github !== undefined) {
      (updateFields.socialLinks as any).github = socialLinks.github;
    }
    if (socialLinks.linkedin !== undefined) {
      (updateFields.socialLinks as any).linkedin = socialLinks.linkedin;
    }
    if (socialLinks.twitter !== undefined) {
      (updateFields.socialLinks as any).twitter = socialLinks.twitter;
    }
  }
  
  if (email) {
    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà',
      });
    }
    updateFields.email = email;
  }
  
  // Mettre à jour les champs supplémentaires
  if (firstName !== undefined) updateFields.firstName = firstName;
  if (lastName !== undefined) updateFields.lastName = lastName;
  if (title !== undefined) updateFields.title = title;
  if (about !== undefined) updateFields.about = about;
  
  // Mise à jour du numéro de téléphone et de l'adresse
  if (phoneNumber !== undefined) updateFields.phoneNumber = phoneNumber;
  if (address !== undefined) updateFields.address = address;
  
  // Mise à jour du rôle (admin uniquement)
  if (req.user?.role === 'admin' && role) {
    updateFields.role = role;
  }
  
  // Mise à jour du statut (admin uniquement)
  if (req.user?.role === 'admin' && status) {
    updateFields.status = status;
  }
  
  // Mise à jour du mot de passe si fourni
  if (password) {
    const salt = await bcrypt.genSalt(10);
    updateFields.password = await bcrypt.hash(password, salt);
  }
  
  // Gestion de l'image de profil si fournie
  console.log('=== Fichiers reçus ===');
  console.log('req.files:', JSON.stringify(req.files, null, 2));
  
  // Vérifier si des fichiers ont été reçus
  if (!req.files) {
    console.log('Aucun fichier reçu dans la requête');
  } else {
    // Afficher les informations de débogage sur les fichiers reçus
    if (Array.isArray(req.files)) {
      console.log('req.files est un tableau avec', req.files.length, 'éléments');
      req.files.forEach((file: any, index: number) => {
        console.log(`Fichier ${index + 1}:`, {
          fieldname: file.fieldname,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          filename: file.filename
        });
      });
    } else if (typeof req.files === 'object') {
      console.log('req.files est un objet avec les clés:', Object.keys(req.files));
      Object.entries(req.files).forEach(([key, files]) => {
        if (Array.isArray(files)) {
          console.log(`Champ ${key}:`, files.map(f => ({
            fieldname: f.fieldname,
            originalname: f.originalname,
            mimetype: f.mimetype,
            size: f.size,
            filename: f.filename
          })));
        } else {
          console.log(`Champ ${key}:`, files);
        }
      });
    }
  }
  
  // Vérifier si un fichier a été téléchargé pour le profil
  let profileImageFile: Express.Multer.File | null = null;
  
  if (Array.isArray(req.files)) {
    // Si c'est un tableau, chercher le fichier avec le bon fieldname
    const file = req.files.find(f => f.fieldname === 'profileImage');
    if (file && !Array.isArray(file)) {
      profileImageFile = file;
    }
  } else if (req.files && typeof req.files === 'object') {
    // Si c'est un objet, accéder directement au tableau de fichiers
    const profileFiles = req.files['profileImage'];
    if (Array.isArray(profileFiles) && profileFiles.length > 0) {
      profileImageFile = profileFiles[0];
    } else if (profileFiles && !Array.isArray(profileFiles)) {
      // Si ce n'est pas un tableau mais un seul fichier
      profileImageFile = profileFiles;
    }
  }
  
  if (profileImageFile) {
    console.log('Nouvelle image de profil détectée:', profileImageFile);
    // Supprimer l'ancienne image si elle existe
    const user = await User.findById(req.params.id);
    if (user?.profileImage) {
      console.log('Suppression de l\'ancienne image de profil:', user.profileImage);
      const { deleteOldProfileImage } = await import('../utils/fileUpload');
      deleteOldProfileImage(user.profileImage);
    }
    
    // Mettre à jour avec le nouveau chemin de l'image
    const { getProfileImagePath } = await import('../utils/fileUpload');
    updateFields.profileImage = getProfileImagePath(profileImageFile.filename);
    console.log('Nouveau chemin de l\'image de profil:', updateFields.profileImage);
  } else if (profileImage === '') {
    // Si profileImage est une chaîne vide, supprimer l'image
    console.log('Suppression de l\'image de profil demandée');
    const user = await User.findById(req.params.id);
    if (user?.profileImage) {
      console.log('Suppression de l\'image de profil existante:', user.profileImage);
      const { deleteOldProfileImage } = await import('../utils/fileUpload');
      deleteOldProfileImage(user.profileImage);
    }
    updateFields.profileImage = '';
  }
  
  // Gestion du CV si fourni
  let cvFile: Express.Multer.File | null = null;
  
  if (Array.isArray(req.files)) {
    // Si c'est un tableau, chercher le fichier avec le bon fieldname
    const file = req.files.find(f => f.fieldname === 'cvFile');
    if (file && !Array.isArray(file)) {
      cvFile = file;
    }
  } else if (req.files && typeof req.files === 'object') {
    // Si c'est un objet, accéder directement au tableau de fichiers
    const cvFiles = req.files['cvFile'];
    if (Array.isArray(cvFiles) && cvFiles.length > 0) {
      cvFile = cvFiles[0];
    } else if (cvFiles && !Array.isArray(cvFiles)) {
      // Si ce n'est pas un tableau mais un seul fichier
      cvFile = cvFiles;
    }
  }
  
  if (cvFile) {
    console.log('Nouveau CV détecté:', cvFile);
    // Supprimer l'ancien CV s'il existe
    const user = await User.findById(req.params.id);
    if (user?.cvUrl) {
      console.log('Suppression de l\'ancien CV:', user.cvUrl);
      const { deleteOldCV } = await import('../middleware/cvUpload');
      deleteOldCV(user.cvUrl);
    }
    
    // Mettre à jour avec le nouveau chemin du CV
    const { getCVPath } = await import('../middleware/cvUpload');
    updateFields.cvUrl = getCVPath(cvFile.filename);
    console.log('Nouveau chemin du CV:', updateFields.cvUrl);
  } else if (cvUrl === '') {
    // Si cvUrl est une chaîne vide, supprimer le CV
    console.log('Suppression du CV demandée');
    const user = await User.findById(req.params.id);
    if (user?.cvUrl) {
      console.log('Suppression du CV existant:', user.cvUrl);
      const { deleteOldCV } = await import('../middleware/cvUpload');
      deleteOldCV(user.cvUrl);
    }
    updateFields.cvUrl = '';
  }

  console.log('Champs à mettre à jour:', JSON.stringify(updateFields, null, 2));
  
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      {
        new: true,
        runValidators: true,
      }
    ).select('-password -refreshToken');

    if (!user) {
      console.log(`Utilisateur non trouvé avec l'ID ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: `Utilisateur non trouvé avec l'ID ${req.params.id}`,
      });
    }
    
    console.log('Utilisateur mis à jour avec succès:', user);
    console.log('=== Fin de la mise à jour utilisateur avec succès ===');
    
    res.status(200).json({
      success: true,
      data: user,
      message: 'Utilisateur mis à jour avec succès',
    });
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    throw error;
  }
});

// @desc    Supprimer un utilisateur
// @route   DELETE /api/users/:id
// @access  Privé/Admin
export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  console.log('Tentative de suppression d\'utilisateur - User ID:', req.user?._id);
  console.log('Rôle de l\'utilisateur:', req.user?.role);
  
  // Seul un admin peut supprimer un utilisateur
  if (req.user?.role !== 'admin') {
    console.log('Accès refusé - Rôle insuffisant');
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

  console.log('Tentative de suppression de l\'utilisateur ID:', req.params.id);
  
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      console.log('Utilisateur non trouvé');
      return res.status(404).json({
        success: false,
        message: `Utilisateur non trouvé avec l'ID ${req.params.id}`,
      });
    }
    
    console.log('Utilisateur supprimé avec succès:', user._id);
    
    return res.status(200).json({
      success: true,
      data: {},
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
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
