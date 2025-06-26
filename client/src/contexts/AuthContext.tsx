import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import authService from '../services/auth.service';
import authConfig from '../config/auth.config';
import { clearAuthTokens, getAuthToken } from '../config/axios';

// Définir le type UserData localement
interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  emailVerified: boolean;
  avatar?: string;
  cvUrl?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  phoneNumber?: string;
  address?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Exporter le type User pour une utilisation dans d'autres composants
export type User = UserData;

type AuthContextType = {
  // État d'authentification
  user: User | null;
  loading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  
  // Méthodes d'authentification
  login: (credentials: { email: string; password: string; rememberMe?: boolean }) => Promise<any>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    passwordConfirm: string;
  }) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<UserData>;
  
  // Gestion de la vérification d'email
  confirmEmail: (token: string) => Promise<{ message: string }>;
  resendVerificationEmail: (email: string) => Promise<{ message: string }>;
  
  // Gestion du mot de passe oublié
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (token: string, password: string, passwordConfirm: string) => Promise<{ message: string }>;
  
  // Mise à jour du profil
  updateProfile: (profileData: Partial<User>) => Promise<UserData>;
  updatePassword: (currentPassword: string, newPassword: string, newPasswordConfirm: string) => Promise<{ message: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Charger l'utilisateur au montage du composant
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getAuthToken();
        if (token) {
          try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
          } catch (error) {
            console.error('Erreur lors du chargement de l\'utilisateur:', error);
            // On ne déconnecte pas automatiquement en cas d'erreur
            // pour éviter les déconnexions intempestives
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initAuth();
  }, []);

  // Fonction pour rafraîchir les données de l'utilisateur
  const refreshUser = useCallback(async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du profil utilisateur:', error);
      throw error;
    }
  }, []);

  // Fonction d'inscription
  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    passwordConfirm: string;
  }) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      
      // Mettre à jour l'utilisateur
      setUser(response.user);
      
      // Rediriger vers la page de confirmation d'email
      navigate(`${authConfig.routes.login}?registered=true&email=${encodeURIComponent(userData.email)}`);
      
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fonction de connexion
  const login = async (credentials: { email: string; password: string; rememberMe?: boolean }) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      // Mettre à jour l'utilisateur
      setUser(response.user);
      
      // Rediriger vers la page précédente ou la page d'accueil
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
      
      return response;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      try {
        await authService.logout();
      } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API de déconnexion:', error);
        // On continue la déconnexion même en cas d'erreur
      }
      // Toujours effacer les tokens et l'utilisateur
      clearAuthTokens();
      setUser(null);
      // Rediriger vers la page de connexion
      navigate(authConfig.routes.login);
    } finally {
      setUser(null);
      setLoading(false);
      
      // Rediriger vers la page de connexion
      navigate(authConfig.routes.login);
    }
  }, [navigate]);

  // Fonction de confirmation d'email
  const confirmEmail = async (token: string) => {
    try {
      setLoading(true);
      const response = await authService.confirmEmail(token);
      
      // Si l'utilisateur est connecté, mettre à jour son état
      if (user) {
        await refreshUser();
      }
      
      return response;
    } catch (error) {
      console.error('Erreur lors de la confirmation de l\'email:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour renvoyer l'email de vérification
  const resendVerificationEmail = async (email: string) => {
    try {
      setLoading(true);
      const response = await authService.resendVerificationEmail(email);
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de vérification:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour demander une réinitialisation de mot de passe
  const forgotPassword = async (email: string) => {
    try {
      setLoading(true);
      const response = await authService.forgotPassword(email);
      return response;
    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation de mot de passe:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour réinitialiser le mot de passe
  const resetPassword = async (token: string, password: string, passwordConfirm: string) => {
    try {
      setLoading(true);
      const response = await authService.resetPassword(token, password, passwordConfirm);
      return response;
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour le profil
  const updateProfile = async (profileData: Partial<User>) => {
    try {
      setLoading(true);
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour le mot de passe
  const updatePassword = async (currentPassword: string, newPassword: string, newPasswordConfirm: string) => {
    try {
      setLoading(true);
      const response = await authService.updatePassword(currentPassword, newPassword, newPasswordConfirm);
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = !!user;

  // Valeur du contexte
  const value = {
    user,
    loading,
    initialized,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
    confirmEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
    updateProfile,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

// Composant de protection de route
export const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, initialized } = useAuth();
  const location = useLocation();

  if (loading || !initialized) {
    // Afficher un écran de chargement pendant la vérification de l'authentification
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Rediriger vers la page de connexion avec l'URL de redirection
    return <Navigate to={authConfig.routes.login} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Composant pour les routes publiques uniquement
export const PublicOnlyRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, initialized } = useAuth();

  if (loading || !initialized) {
    // Afficher un écran de chargement pendant la vérification de l'authentification
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Rediriger vers la page d'accueil si l'utilisateur est déjà connecté
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
