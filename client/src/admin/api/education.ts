import apiClient from './apiClient';

export interface EducationBE {
  _id: string;
  degree: string;
  institution: string;
  startDate: string; 
  endDate?: string; 
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EducationCreationPayload {
  degree: string;
  institution: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export type EducationUpdatePayload = Partial<EducationCreationPayload>;

const EDUCATION_API_URL = '/api/v1/educations';

export const getEducations = async (): Promise<EducationBE[]> => {
  const response = await apiClient.get<{ data: EducationBE[] }>(EDUCATION_API_URL);
  return response.data.data;
};

export const getEducation = async (id: string): Promise<EducationBE> => {
  const response = await apiClient.get<{ data: EducationBE }>(`${EDUCATION_API_URL}/${id}`);
  return response.data.data;
};

export const createEducation = async (educationData: EducationCreationPayload): Promise<EducationBE> => {
  const response = await apiClient.post<{ data: EducationBE }>(EDUCATION_API_URL, educationData);
  return response.data.data;
};

export const updateEducation = async (id: string, educationData: EducationUpdatePayload): Promise<EducationBE> => {
  const response = await apiClient.put<{ data: EducationBE }>(`${EDUCATION_API_URL}/${id}`, educationData);
  return response.data.data;
};

export const deleteEducation = async (id: string): Promise<void> => {
  await apiClient.delete(`${EDUCATION_API_URL}/${id}`);
};
