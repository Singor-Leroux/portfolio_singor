import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig, AxiosInstance } from 'axios';
import authConfig from './auth.config';

// Interfaces pour les réponses d'erreur
interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

interface TokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Créer une instance d'axios avec une configuration de base
const api: AxiosInstance = axios.create({
  baseURL: authConfig.apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 15000, // 15 secondes de timeout
});

// Fonction pour définir le token d'authentification
export const setAuthToken = (token: string | null) => {
  if (token) {
    // Appliquer le token à l'en-tête d'autorisation
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // Stocker le token dans le localStorage
    localStorage.setItem(authConfig.token.name, token);
  } else {
    // Supprimer l'en-tête d'autorisation
    delete api.defaults.headers.common['Authorization'];
    // Supprimer le token du localStorage
    localStorage.removeItem(authConfig.token.name);
  }
};

// Fonction pour définir le refresh token
export const setRefreshToken = (refreshToken: string | null) => {
  if (refreshToken) {
    localStorage.setItem(authConfig.token.refreshName, refreshToken);
  } else {
    localStorage.removeItem(authConfig.token.refreshName);
  }
};

// Fonction pour récupérer le token d'authentification
export const getAuthToken = (): string | null => {
  return localStorage.getItem(authConfig.token.name);
};

// Fonction pour récupérer le refresh token
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(authConfig.token.refreshName);
};

// Fonction pour effacer tous les tokens
export const clearAuthTokens = () => {
  localStorage.removeItem(authConfig.token.name);
  localStorage.removeItem(authConfig.token.refreshName);
  delete api.defaults.headers.common['Authorization'];
};

// Initialiser le token depuis le localStorage au démarrage
const token = getAuthToken();
if (token) {
  setAuthToken(token);
  // Ne pas effacer le token ici pour maintenir la session
}

// Intercepteur pour ajouter le token d'authentification aux requêtes
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Ne pas ajouter le token pour les routes publiques
    const publicEndpoints = [
      authConfig.endpoints.auth.login,
      authConfig.endpoints.auth.register,
      authConfig.endpoints.auth.confirmEmail,
      authConfig.endpoints.auth.resendVerificationEmail,
      authConfig.endpoints.auth.forgotPassword,
      authConfig.endpoints.auth.resetPassword,
    ];

    if (publicEndpoints.some(endpoint => config.url?.endsWith(endpoint))) {
      return config;
    }

    const token = getAuthToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Ajouter un timestamp pour éviter le cache
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    
    return config;
  },
  (error: AxiosError) => {
    if (authConfig.debug) {
      console.error('Erreur de requête:', error);
    }
    return Promise.reject(error);
  }
);

// Gestion des erreurs globales
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Vous pouvez ajouter un traitement global pour les réponses réussies ici
    return response;
  },
  async (error: AxiosError) => {
    if (!error.response) {
      // La requête a été faite mais aucune réponse n'a été reçue
      const errorMessage = authConfig.messages.errors.network;
      if (authConfig.debug) {
        console.error('Erreur réseau:', error);
      }
      return Promise.reject(new Error(errorMessage));
    }

    const { status, data } = error.response as { status: number; data: ApiErrorResponse };
    const originalRequest = error.config as ExtendedAxiosRequestConfig;

    // Gestion des erreurs HTTP
    switch (status) {
      case 401: // Non autorisé
        // Si c'est une erreur 401 et que ce n'est pas une tentative de rafraîchissement de token
        if (originalRequest.url?.includes(authConfig.endpoints.auth.refresh)) {
          // Si le rafraîchissement échoue, on ne déconnecte pas immédiatement
          // pour permettre à l'utilisateur de se reconnecter manuellement
          return Promise.reject(error);
        }

        // Si ce n'est pas une tentative de reconnexion et qu'on a un refresh token
        const refreshToken = getRefreshToken();
        if (refreshToken && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Essayer de rafraîchir le token
            const response = await axios.post<ApiResponse<TokenResponse>>(
              `${authConfig.apiUrl}${authConfig.endpoints.auth.refresh}`,
              { refreshToken }
            );
            
            const { token, refreshToken: newRefreshToken } = response.data.data;
            
            // Mettre à jour les tokens
            setAuthToken(token);
            if (newRefreshToken) {
              setRefreshToken(newRefreshToken);
            }
            
            // Rejouer la requête originale avec le nouveau token
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          } catch (refreshError) {
            // En cas d'échec du rafraîchissement, on rejette simplement l'erreur
            // sans déconnecter l'utilisateur immédiatement
            return Promise.reject(refreshError);
          }
        }
        
        // Si on est sur la page de login, on ne fait rien
        if (!window.location.pathname.includes(authConfig.routes.login)) {
          // Rediriger vers la page de login avec la redirection
          const currentPath = window.location.pathname + window.location.search;
          const redirectTo = currentPath !== '/' ? `?redirect=${encodeURIComponent(currentPath)}` : '';
          window.location.href = `${authConfig.routes.login}${redirectTo}`;
        }
        break;
        
      case 403: // Accès refusé
        if (authConfig.debug) {
          console.error('Erreur 403:', data?.message || 'Accès refusé');
        }
        // Rediriger vers la page d'accès refusé ou la page d'accueil
        if (!window.location.pathname.includes('/unauthorized')) {
          window.location.href = '/unauthorized';
        }
        break;
        
      case 404: // Ressource non trouvée
        if (authConfig.debug) {
          console.error('Erreur 404:', data?.message || 'Ressource non trouvée');
        }
        // Rediriger vers la page 404 si nécessaire
        if (!window.location.pathname.includes('/not-found')) {
          window.location.href = '/not-found';
        }
        break;
        
      case 422: // Erreur de validation
        // Les erreurs de validation sont gérées par le composant appelant
        if (authConfig.debug) {
          console.error('Erreur de validation:', data?.errors);
        }
        break;
        
      case 429: // Trop de requêtes
        if (authConfig.debug) {
          console.error('Trop de requêtes. Veuillez patienter avant de réessayer.');
        }
        // Afficher un message à l'utilisateur
        break;
        
      case 500: // Erreur serveur
      case 502: // Bad Gateway
      case 503: // Service indisponible
      case 504: // Gateway Timeout
        if (authConfig.debug) {
          console.error(`Erreur serveur (${status}):`, data?.message || 'Erreur interne du serveur');
        }
        // Rediriger vers une page d'erreur serveur
        if (!window.location.pathname.includes('/server-error')) {
          window.location.href = '/server-error';
        }
        break;
        
      default:
        if (authConfig.debug) {
          console.error(`Erreur ${status}:`, data?.message || 'Une erreur est survenue');
        }
    }

    // Renvoyer une erreur avec le message du serveur si disponible
    const errorMessage = data?.message || authConfig.messages.errors.default;
    return Promise.reject(new Error(errorMessage));
    
  }
);

export default api;
