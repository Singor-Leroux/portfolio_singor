import apiClient from './apiClient';

type LoginData = {
  email: string;
  password: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type LoginResponse = {
  success: boolean;
  token: string;
  user: User;
};

export const login = async (data: LoginData): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', data);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await apiClient.post('/api/v1/auth/logout');
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<{ data: User }>('/api/v1/auth/me');
  return response.data.data;
};
