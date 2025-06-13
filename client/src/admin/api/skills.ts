import apiClient from './apiClient'; // Utilisation du client configuré

export type SkillLevel = 'Débutant' | 'Intermédiaire' | 'Confirmé' | 'Expert';
export type SkillCategory = 'frontend' | 'backend' | 'database' | 'devops' | 'other';

export interface Skill {
  _id?: string; // Utilisation de _id
  name: string;
  level?: SkillLevel; // Type corrigé en string enum, et rendu optionnel
  category: SkillCategory;
  createdAt?: string; // Ajouté car renvoyé par le backend
  updatedAt?: string; // Ajouté car renvoyé par le backend
}

// Interface pour la charge utile de création, pour plus de clarté
export interface SkillCreationPayload {
  name: string;
  level?: SkillLevel;
  category: SkillCategory;
}

// Interface pour la charge utile de mise à jour
export interface SkillUpdatePayload {
  name?: string;
  level?: SkillLevel;
  category?: SkillCategory;
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

export const getSkills = async (): Promise<Skill[]> => {
  const response = await apiClient.get<BackendListResponse<Skill>>('/api/v1/skills');
  return response.data.data;
};

export const getSkill = async (id: string): Promise<Skill> => {
  const response = await apiClient.get<BackendItemResponse<Skill>>(`/api/v1/skills/${id}`);
  return response.data.data;
};

export const createSkill = async (skill: SkillCreationPayload): Promise<Skill> => {
  const response = await apiClient.post<BackendItemResponse<Skill>>('/api/v1/skills', skill);
  return response.data.data;
};

export const updateSkill = async (id: string, skill: SkillUpdatePayload): Promise<Skill> => {
  const response = await apiClient.put<BackendItemResponse<Skill>>(`/api/v1/skills/${id}`, skill);
  return response.data.data;
};

export const deleteSkill = async (id: string): Promise<void> => {
  // La réponse de suppression est un peu différente, nous n'avons pas besoin de retourner son contenu ici
  // mais nous pouvons vérifier la réponse si nécessaire.
  await apiClient.delete<BackendDeleteResponse>(`/api/v1/skills/${id}`);
};
