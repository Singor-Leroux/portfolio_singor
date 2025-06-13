import axios, { AxiosResponse } from 'axios';

// Types pour les compétences
export interface Skill {
  _id: string;
  name: string;
  level: number;
  category: string;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Types pour les projets
export interface Project {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Types pour les certifications
export interface Certification {
  _id: string;
  title: string;
  issuer: string;
  date: string;
  credentialUrl?: string;
  imageUrl?: string;
}

// Types pour l'éducation
export interface Education {
  _id: string;
  degree: string;
  institution: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

// Types pour l'expérience professionnelle
export interface Experience {
  _id: string;
  position: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  description: string[];
  technologies: string[];
}

// Type pour la réponse API
interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Configuration de l'URL de l'API
// En mode développement, utilisez le proxy configuré dans vite.config.ts
// En production, utilisez l'URL de l'API définie dans les variables d'environnement
const getApiUrl = () => {
  // En mode développement, utilisez le chemin relatif qui sera proxyfié par Vite
  if (import.meta.env.DEV) {
    return '/api/v1';
  }
  // En production, utilisez la variable d'environnement ou une URL par défaut
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
};

// Créer une instance d'axios avec l'URL de base configurée
export const api = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true, // Important pour les cookies d'authentification
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour gérer les erreurs CORS et les redirections
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Erreur CORS
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        console.error('Erreur réseau - Vérifiez votre connexion et la configuration CORS du serveur');
      }
      
      // Redirection en cas d'erreur 401 (Non autorisé)
      if (error.response.status === 401) {
        // Stocker l'URL actuelle pour rediriger après la connexion
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        // Rediriger vers la page de connexion
        window.location.href = '/login';
      }
      
      // Erreur CORS explicite
      if (error.response.data?.message?.includes('CORS')) {
        console.error('Erreur CORS:', error.response.data.message);
      }
    }
    
    return Promise.reject(error);
  }
);

// Intercepteur pour ajouter le token d'authentification aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Fonctions pour chaque type de données
export const getSkills = async (): Promise<Skill[]> => {
  const { data } = await api.get<ApiResponse<Skill[]>>('/skills');
  return data.data; // Retourne data.data car la réponse est de type { success: boolean, data: Skill[], message?: string }
};

export const getSkillById = async (id: string): Promise<Skill> => {
  const { data } = await api.get<ApiResponse<Skill>>(`/skills/${id}`);
  return data.data;
};

export const getProjects = async (): Promise<Project[]> => {
  const { data } = await api.get<ApiResponse<Project[]>>('/projects');
  return data.data;
};

export const getProjectById = async (id: string): Promise<Project> => {
  const { data } = await api.get<ApiResponse<Project>>(`/projects/${id}`);
  return data.data;
};

export const getCertifications = async (): Promise<Certification[]> => {
  const { data } = await api.get<ApiResponse<Certification[]>>('/certifications');
  return data.data;
};

export const getEducation = async (): Promise<Education[]> => {
  const { data } = await api.get<ApiResponse<Education[]>>('/educations');
  return data.data; // Extraction des données de la réponse
};

export const getExperiences = async (): Promise<Experience[]> => {
  const { data } = await api.get<ApiResponse<Experience[]>>('/experiences');
  return data.data; // Extraction des données de la réponse
};

export const getExperienceById = async (id: string): Promise<Experience> => {
  const { data } = await api.get<ApiResponse<Experience>>(`/experiences/${id}`);
  return data.data; // Extraction des données de la réponse
};

// Opérations CRUD pour les compétences
export const createSkill = async (skillData: Omit<Skill, '_id'>): Promise<AxiosResponse<ApiResponse<Skill>>> => 
  await api.post('/skills', skillData);

export const updateSkill = async (id: string, skillData: Partial<Skill>): Promise<AxiosResponse<ApiResponse<Skill>>> => 
  await api.put(`/skills/${id}`, skillData);

export const deleteSkill = async (id: string): Promise<AxiosResponse<ApiResponse<{ _id: string }>>> => 
  await api.delete(`/skills/${id}`);

// Opérations CRUD pour les projets
export const createProject = async (projectData: FormData): Promise<AxiosResponse<ApiResponse<Project>>> => 
  await api.post('/projects', projectData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

export const updateProject = async (id: string, projectData: FormData): Promise<AxiosResponse<ApiResponse<Project>>> =>
  await api.put(`/projects/${id}`, projectData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

export const deleteProject = async (id: string): Promise<AxiosResponse<ApiResponse<{ _id: string }>>> =>
  await api.delete(`/projects/${id}`);

// Fonction utilitaire pour extraire les données de la réponse
const extractData = <T,>(response: AxiosResponse<ApiResponse<T>>): T => response.data.data;

// Exporter les fonctions avec extraction des données
export const apiService = {
  // Fetch
  getSkills,
  getSkillById,
  getProjects,
  getProjectById,
  getCertifications,
  getEducation,
  getExperiences,
  getExperienceById,
  
  // Skills
  createSkill: (data: Omit<Skill, '_id'>) => createSkill(data).then(extractData<Skill>),
  updateSkill: (id: string, data: Partial<Skill>) => updateSkill(id, data).then(extractData<Skill>),
  deleteSkill: (id: string) => deleteSkill(id).then(extractData<{ _id: string }>),
  
  // Projects
  createProject: (data: FormData) => createProject(data).then(extractData<Project>),
  updateProject: (id: string, data: FormData) => updateProject(id, data).then(extractData<Project>),
  deleteProject: (id: string) => deleteProject(id).then(extractData<{ _id: string }>),
};
