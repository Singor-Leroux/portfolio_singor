import api from '../config/axios';

import { UserProfile as SharedUserProfile } from '../types/user';

export interface UserProfile extends Omit<SharedUserProfile, 'phone'> {
  phoneNumber?: string;
  cvUrl?: string;
}

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    // Récupère le premier utilisateur (ou modifiez pour récupérer un utilisateur spécifique)
    const response = await api.get('/users');
    console.log('Réponse de l\'API (users):', response.data);
    if (response.data.data && response.data.data.length > 0) {
      const userData = response.data.data[0];
      console.log('Données utilisateur récupérées:', userData);
      return userData; // Retourne le premier utilisateur
    }
    throw new Error('Aucun utilisateur trouvé');
  } catch (error) {
    console.error('Erreur lors de la récupération du profil utilisateur:', error);
    throw error;
  }
};
