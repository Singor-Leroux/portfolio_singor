import api, { setAuthToken, setRefreshToken, clearAuthTokens, getAuthToken } from '../config/axios';
import authConfig from '../config/auth.config';

// Types pour les données de l'utilisateur
interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  emailVerified: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Types pour les réponses de l'API
export interface AuthResponse {
  user: UserData;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Service d'authentification
const authService = {
  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<{ data: AuthResponse }>(
        authConfig.endpoints.auth.register,
        userData
      );

      // Stocker le token et le refresh token
      setAuthToken(response.data.data.token);
      setRefreshToken(response.data.data.refreshToken);

      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  },

  /**
   * Connexion de l'utilisateur
   */
  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      console.log('Tentative de connexion avec les identifiants:', {
        email: credentials.email,
        hasPassword: !!credentials.password
      });

      const response = await api.post<AuthResponse>(
        authConfig.endpoints.auth.login,
        credentials
      );

      console.log('Réponse brute du serveur:', response);
      console.log('Données de la réponse:', response.data);

      // Vérifier si la réponse a la structure attendue
      if (!response.data || !response.data.token) {
        console.error('Structure de réponse inattendue:', response.data);
        throw new Error('La structure de la réponse du serveur est incorrecte');   
      }

      // Stocker le token et le refresh token
      setAuthToken(response.data.token);
      setRefreshToken(response.data.refreshToken || '');

      // Si l'utilisateur a coché "Se souvenir de moi", stocker le token dans un cookie persistant
      if (credentials.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  },

  /**
   * Déconnexion de l'utilisateur
   */
  async logout(): Promise<void> {
    try {
      // Appeler l'API de déconnexion pour invalider le token côté serveur       
      await api.post(authConfig.endpoints.auth.logout);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // On continue même en cas d'erreur pour nettoyer le client
    } finally {
      // Toujours nettoyer les tokens côté client
      clearAuthTokens();

      // Supprimer le flag rememberMe
      localStorage.removeItem('rememberMe');

      // Rediriger vers la page de connexion
      window.location.href = authConfig.routes.login;
    }
  },

  /**
   * Récupérer les informations de l'utilisateur connecté
   */
  async getCurrentUser(): Promise<UserData> {
    try {
      const response = await api.get<{ data: UserData }>(authConfig.endpoints.auth.me);
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des informations utilisateur:', error);
      throw error; // Propager l'erreur pour une gestion plus approfondie
    }
  },

  /**
   * Vérifier si l'utilisateur est authentifié
   * Vérifie la présence du token sans valider sa validité côté serveur
   */
  isAuthenticated(): boolean {
    const token = getAuthToken();
    if (!token) return false;
    
    // Vérifier si le token est expiré (optionnel, basé sur la date d'expiration dans le token)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp < Date.now() / 1000) {
        console.warn('Le token est expiré');
        return false;
      }
      return true;
    } catch (e) {
      console.error('Erreur lors de la vérification du token:', e);
      return false;
    }
  },

  /**
   * Confirmer l'email avec un token
   */
  async confirmEmail(token: string): Promise<{ message: string }> {
    try {
      const response = await api.get<{ data: { message: string } }>(
        `${authConfig.endpoints.auth.confirmEmail}?token=${token}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la confirmation de l\'email:', error);
      throw error;
    }
  },

  /**
   * Renvoyer l'email de vérification
   */
  async resendVerificationEmail(email: string): Promise<{ message: string }> {      
    try {
      const response = await api.post<{ data: { message: string } }>(
        authConfig.endpoints.auth.resendVerificationEmail,
        { email }
      );
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de vérification:', error);
      throw error;
    }
  },

  /**
   * Demander une réinitialisation de mot de passe
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ data: { message: string } }>(
        authConfig.endpoints.auth.forgotPassword,
        { email }
      );
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation de mot de passe:', error);
      throw error;
    }
  },

  /**
   * Réinitialiser le mot de passe
   */
  async resetPassword(token: string, password: string, passwordConfirm: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ data: { message: string } }>(
        authConfig.endpoints.auth.resetPassword,
        { token, password, passwordConfirm }
      );
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error); 
      throw error;
    }
  },

  /**
   * Mettre à jour les informations du profil
   */
  async updateProfile(profileData: Partial<UserData>): Promise<UserData> {
    try {
      const response = await api.put<{ data: UserData }>(
        authConfig.endpoints.auth.updateProfile,
        profileData
      );
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour le mot de passe
   */
  async updatePassword(currentPassword: string, newPassword: string, newPasswordConfirm: string): Promise<{ message: string }> {
    try {
      const response = await api.put<{ data: { message: string } }>(
        authConfig.endpoints.auth.updatePassword,
        { currentPassword, newPassword, newPasswordConfirm }
      );
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);      
      throw error;
    }
  },
};

export default authService;
