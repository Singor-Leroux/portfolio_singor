import apiClient from './apiClient'; // Assuming apiClient is in the same directory or adjust path

// Interface for Certification data coming from the backend
export interface CertificationBE {
  _id: string;
  title: string;
  issuer: string;
  date: string; // Keep as string for now, align with existing form
  credentialUrl: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Interface for creating a new certification (payload for POST request)
export interface CertificationCreationPayload {
  title: string;
  issuer: string;
  date: string;
  credentialUrl: string;
  imageUrl?: string;
}

// Interface for updating an existing certification (payload for PUT request)
export type CertificationUpdatePayload = Partial<CertificationCreationPayload>;

export const getCertifications = async (): Promise<CertificationBE[]> => {
  const response = await apiClient.get<{ data: CertificationBE[] }>('/api/v1/certifications');
  return response.data.data;
};

export const getCertification = async (id: string): Promise<CertificationBE> => {
  const response = await apiClient.get<{ data: CertificationBE }>(`/api/v1/certifications/${id}`);
  return response.data.data;
};

export const createCertification = async (payload: FormData): Promise<CertificationBE> => {
  const response = await apiClient.post<{ data: CertificationBE }>('/api/v1/certifications', payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

export const updateCertification = async (id: string, payload: FormData): Promise<CertificationBE> => {
  const response = await apiClient.put<{ data: CertificationBE }>(`/api/v1/certifications/${id}`, payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

export const deleteCertification = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/v1/certifications/${id}`);
};
