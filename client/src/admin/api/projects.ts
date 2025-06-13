import apiClient from './apiClient';

export interface ProjectBE {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCreationPayload {
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;
  featured: boolean;
  imageFile?: File | null;
  imageUrl?: string;
}

export interface ProjectUpdatePayload extends Partial<Omit<ProjectCreationPayload, 'imageFile' | 'technologies'>> {
  id?: string;
  imageUrl?: string;
  technologies?: string | string[];
  [key: string]: any; // Permet les propriétés supplémentaires pour FormData
}

// Structure de réponse générique du backend pour une liste
interface BackendListResponse<T> {
  success: boolean;
  count: number;
  data: T[];
}

// Structure de réponse générique du backend pour un seul item ou création/mise à jour
interface BackendItemResponse<T> {
  success: boolean;
  data: T;
}

// Structure de réponse pour la suppression
interface BackendDeleteResponse {
  success: boolean;
  data: object; // Souvent un objet vide
  message?: string;
}

export const getProjects = async (): Promise<ProjectBE[]> => {
  const response = await apiClient.get<BackendListResponse<ProjectBE>>('/api/v1/projects');
  return response.data.data;
};

export const getProject = async (id: string): Promise<ProjectBE> => {
  const response = await apiClient.get<BackendItemResponse<ProjectBE>>(`/api/v1/projects/${id}`);
  return response.data.data;
};

export const createProject = async (project: ProjectCreationPayload | FormData): Promise<ProjectBE> => {
  const response = await apiClient.post<BackendItemResponse<ProjectBE>>('/api/v1/projects', project, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

export const updateProject = async (id: string, project: Omit<ProjectUpdatePayload, 'id'> | FormData): Promise<ProjectBE> => {
  // Déterminer si nous avons affaire à un FormData ou à un objet standard
  const isFormData = project instanceof FormData;
  
  // Si c'est un FormData, on y ajoute l'ID si ce n'est pas déjà fait
  if (isFormData && !project.has('id')) {
    project.append('id', id);
  }
  
  const response = await apiClient.put<BackendItemResponse<ProjectBE>>(
    `/api/v1/projects/${id}`, 
    project,
    {
      headers: isFormData 
        ? { 'Content-Type': 'multipart/form-data' } 
        : { 'Content-Type': 'application/json' }
    }
  );
  return response.data.data;
};

export const deleteProject = async (id: string): Promise<void> => {
  await apiClient.delete<BackendDeleteResponse>(`/api/v1/projects/${id}`);
};
