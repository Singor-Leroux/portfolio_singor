import api, { setAuthToken as setApiAuthToken } from '../config/axios';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export const login = async (data: LoginData): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', data);
  return response.data;
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } finally {
    // Supprimer le token même en cas d'échec de la déconnexion côté serveur
    localStorage.removeItem('token');
    setApiAuthToken('');
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await api.get<{ success: boolean; data: User }>('/auth/me');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('Données utilisateur non valides');
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    throw error;
  }
};

// Fonction pour définir le token d'authentification
// Cette fonction est utilisée par le contexte d'authentification
export const setAuthToken = (token: string) => {
  setApiAuthToken(token);
};
