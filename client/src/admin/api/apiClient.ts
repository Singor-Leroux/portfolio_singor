import axios from 'axios';

// Interface pour les erreurs API standardisées
export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

// Création de l'instance axios avec des en-têtes par défaut
const apiClient = axios.create({
  // Ne pas mettre de baseURL ici car elle est déjà gérée par le proxy Vite
  baseURL: '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important pour les cookies d'authentification
});

// Intercepteur de requête pour ajouter le token JWT et gérer les FormData
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Initialiser les en-têtes si non définis
    config.headers = config.headers || {};
    
    // Ne pas définir le Content-Type pour FormData, le navigateur le fera automatiquement
    if (!(config.data instanceof FormData)) {
      // Pour les requêtes non-FormData, définir le Content-Type à application/json
      if (config.headers['Content-Type'] === undefined) {
        config.headers['Content-Type'] = 'application/json';
      }
    } else {
      // Pour FormData, supprimer le Content-Type pour laisser le navigateur le définir avec la boundary
      delete config.headers['Content-Type'];
    }

    // Ajouter le token d'authentification si disponible
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestion des erreurs réseau
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        message: 'La requête a expiré. Veuillez réessayer.',
        status: 408,
      } as ApiError);
    }

    // Gestion des erreurs de réponse du serveur
    if (error.response) {
      const { status, data } = error.response;
      
      // Erreur d'authentification
      if (status === 401) {
        // Déconnexion de l'utilisateur
        localStorage.removeItem('token');
        // Redirection vers la page de connexion
        window.location.href = '/login';
      }

      return Promise.reject({
        message: data?.message || 'Une erreur est survenue',
        status,
        errors: data?.errors,
      } as ApiError);
    }

    // Erreur inconnue
    return Promise.reject({
      message: 'Une erreur inconnue est survenue',
      status: 0,
    } as ApiError);
  }
);

export default apiClient;
