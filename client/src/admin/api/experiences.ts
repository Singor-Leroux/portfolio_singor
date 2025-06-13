import apiClient from './apiClient';

// Interface pour les données d'expérience telles que reçues du backend
export interface ExperienceBE {
  _id: string; // Notez _id
  title: string;
  company: string;
  location?: string;
  startDate: string; // Les dates sont des chaînes (YYYY-MM-DD) lors de la communication API
  endDate?: string;
  description?: string;
  technologies?: string[];
  createdAt: string;
  updatedAt: string;
}

// Interface pour la création d'une expérience
export interface ExperienceCreationPayload {
  title: string;
  company: string;
  location?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD, optionnel
  description?: string;
  technologies?: string[];
}

// Interface pour la mise à jour d'une expérience
export type ExperienceUpdatePayload = Partial<ExperienceCreationPayload>;

// Structure de la réponse pour getExperiences
interface GetExperiencesResponse {
  success: boolean;
  count: number;
  data: ExperienceBE[];
}

// Structure de la réponse pour une seule expérience (get, create, update)
interface SingleExperienceResponse {
  success: boolean;
  data: ExperienceBE;
}

// Structure de la réponse pour deleteExperience
interface DeleteResponse {
  success: boolean;
  data: Record<string, never>; // Objet vide
}

export const getExperiences = async (): Promise<ExperienceBE[]> => {
  const response = await apiClient.get<GetExperiencesResponse>('/api/v1/experiences');
  return response.data.data;
};

// getExperienceById n'est pas utilisé directement par SkillsPage, mais peut être utile
export const getExperienceById = async (id: string): Promise<ExperienceBE> => {
  const response = await apiClient.get<SingleExperienceResponse>(`/api/v1/experiences/${id}`);
  return response.data.data;
};

export const createExperience = async (experienceData: ExperienceCreationPayload): Promise<ExperienceBE> => {
  const response = await apiClient.post<SingleExperienceResponse>('/api/v1/experiences', experienceData);
  return response.data.data;
};

export const updateExperience = async (id: string, experienceData: ExperienceUpdatePayload): Promise<ExperienceBE> => {
  const response = await apiClient.put<SingleExperienceResponse>(`/api/v1/experiences/${id}`, experienceData);
  return response.data.data;
};

export const deleteExperience = async (id: string): Promise<void> => {
  await apiClient.delete<DeleteResponse>(`/api/v1/experiences/${id}`);
  // La réponse pour delete est { success: true, data: {} }, pas besoin de retourner quoi que ce soit ici
};
