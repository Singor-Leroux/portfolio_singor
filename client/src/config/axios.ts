import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig, AxiosInstance } from 'axios';

// Créer une instance d'axios avec une configuration de base
const api: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 secondes de timeout
});

// Fonction pour définir le token d'authentification
export const setAuthToken = (token: string | null) => {
  if (token) {
    // Appliquer le token à l'en-tête d'autorisation
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // Stocker le token dans le localStorage
    localStorage.setItem('token', token);
  } else {
    // Supprimer l'en-tête d'autorisation
    delete api.defaults.headers.common['Authorization'];
    // Supprimer le token du localStorage
    localStorage.removeItem('token');
  }
};

// Initialiser le token depuis le localStorage au démarrage
const token = localStorage.getItem('token');
if (token) {
  setAuthToken(token);
}

// Intercepteur pour ajouter le token d'authentification aux requêtes
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Ne pas ajouter le token pour les routes d'authentification
    const publicEndpoints = ['/auth/login', '/auth/register'];
    if (publicEndpoints.some(endpoint => config.url?.includes(endpoint))) {
      return config;
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('Erreur de requête:', error);
    return Promise.reject(error);
  }
);

// Gestion des erreurs globales
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (!error.response) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('Pas de réponse du serveur. Vérifiez votre connexion internet.');
      return Promise.reject(error);
    }

    // Gestion des erreurs HTTP
    switch (error.response.status) {
      case 401:
        // Si on est sur la page de login, on ne fait rien
        if (window.location.pathname !== '/login') {
          // Supprimer le token invalide
          localStorage.removeItem('token');
          
          // Rediriger vers la page de login avec la redirection
          const currentPath = window.location.pathname + window.location.search;
          const redirectTo = currentPath !== '/' ? `?redirect=${encodeURIComponent(currentPath)}` : '';
          window.location.href = `/login${redirectTo}`;
        }
        break;
        
      case 403:
        console.error('Accès refusé: Vous n\'avez pas les permissions nécessaires');
        window.location.href = '/unauthorized';
        break;
        
      case 404:
        console.error('Ressource non trouvée:', error.config?.url);
        break;
        
      case 500:
        console.error('Erreur serveur interne');
        break;
        
      default:
        console.error(`Erreur ${error.response.status}:`, error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
