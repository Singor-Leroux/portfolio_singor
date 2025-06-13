import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../api/auth';

// Définir l'interface User
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Clé pour le stockage local
authApi.setAuthToken(localStorage.getItem('token') || '');

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();

  // Fonction pour charger l'utilisateur connecté
  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (token) {
        authApi.setAuthToken(token);
        const userData = await authApi.getCurrentUser();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Échec du chargement de l\'utilisateur', error);
      // En cas d'erreur, on nettoie le token invalide
      localStorage.removeItem('token');
      authApi.setAuthToken('');
      setUser(null);
    } finally {
      setLoading(false);
      if (!initialized) setInitialized(true);
    }
  }, [initialized]);

  // Charger l'utilisateur au montage du composant
  useEffect(() => {
    loadUser();
    
    // Vérifier périodiquement la validité du token (toutes les 5 minutes)
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token) {
        loadUser().catch(console.error);
      }
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [loadUser]);

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authApi.login({ email, password });
      
      // Stocker le token
      localStorage.setItem('token', response.token);
      authApi.setAuthToken(response.token);
      
      // Mettre à jour l'utilisateur
      setUser(response.user);
      
      // Rediriger vers la page précédente ou le tableau de bord
      const redirectPath = localStorage.getItem('redirectAfterLogin') || '/admin';
      localStorage.removeItem('redirectAfterLogin');
      navigate(redirectPath);
    } catch (error) {
      console.error('Échec de la connexion', error);
      throw error; // Propager l'erreur pour la gérer dans le composant
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authApi.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyer le stockage local dans tous les cas
      localStorage.removeItem('token');
      authApi.setAuthToken('');
      setUser(null);
      setLoading(false);
      
      // Rediriger vers la page de connexion
      navigate('/admin/login');
    }
  }, [navigate]);

  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        loading, 
        initialized, 
        isAuthenticated 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
