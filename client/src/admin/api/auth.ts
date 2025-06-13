import axios from 'axios';

const API_URL = '/api/v1/auth';

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
  const response = await axios.post<LoginResponse>(`${API_URL}/login`, data);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await axios.post(`${API_URL}/logout`);
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await axios.get<{ data: User }>(`${API_URL}/me`);
  return response.data.data;
};
