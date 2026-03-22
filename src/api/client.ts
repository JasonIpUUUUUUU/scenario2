import axios from 'axios';
import type {
  User,
  Group,
  GroupMember,
  Event,
  GroupEvent,
  GroupEventParticipant,
  GroupPrivacy,
  PreferredPeriod,
  AvailabilitySlot,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../types/api';

const API_BASE_URL = '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },
  getMe: async (): Promise<{ user: User }> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export const usersApi = {
  updateMe: async (data: Partial<User> & { password?: string }): Promise<{ user: User }> => {
    const response = await apiClient.patch('/users/me', data);
    return response.data;
  },
};

export const groupsApi = {
  create: async (data: { name: string }): Promise<{ group: Group }> => {
    const response = await apiClient.post('/groups', data);
    return response.data;
  },
  list: async (params?: { limit?: number; offset?: number }): Promise<{ groups: Group[] }> => {
    const response = await apiClient.get('/groups', { params });
    return response.data;
  },
  get: async (groupId: string): Promise<{ group: Group }> => {
    const response = await apiClient.get(`/groups/${groupId}`);
    return response.data;
  },
  update: async (groupId: string, data: { name: string }): Promise<{ group: Group }> => {
    const response = await apiClient.patch(`/groups/${groupId}`, data);
    return response.data;
  },
  delete: async (groupId: string): Promise<void> => {
    await apiClient.delete(`/groups/${groupId}`);
  },
  getMembers: async (groupId: string): Promise<{ members: GroupMember[] }> => {
    const response = await apiClient.get(`/groups/${groupId}/members`);
    return response.data;
  },
  addMember: async (groupId: string, data: { user_id: string; role: string }): Promise<{ member: GroupMember }> => {
    const response = await apiClient.post(`/groups/${groupId}/members`, data);
    return response.data;
  },
  updateMember: async (
    groupId: string,
    userId: string,
    data: { role?: string; status?: string }
  ): Promise<{ member: GroupMember }> => {
    const response = await apiClient.patch(`/groups/${groupId}/members/${userId}`, data);
    return response.data;
  },
  removeMember: async (groupId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/groups/${groupId}/members/${userId}`);
  },
  getMyPrivacy: async (groupId: string): Promise<{ privacy: GroupPrivacy }> => {
    const response = await apiClient.get(`/groups/${groupId}/privacy/me`);
    return response.data;
  },
  setMyPrivacy: async (groupId: string, data: { share_level: number }): Promise<{ privacy: GroupPrivacy }> => {
    const response = await apiClient.put(`/groups/${groupId}/privacy/me`, data);
    return response.data;
  },
};

export const eventsApi = {
  list: async (params?: {
    start_ts?: string;
    end_ts?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ events: Event[] }> => {
    const response = await apiClient.get('/events', { params });
    return response.data;
  },
  create: async (data: {
    start_ts: string;
    end_ts: string;
    title: string;
    description?: string;
    location?: string;
  }): Promise<{ event: Event }> => {
    const response = await apiClient.post('/events', data);
    return response.data;
  },
  get: async (eventId: string): Promise<{ event: Event }> => {
    const response = await apiClient.get(`/events/${eventId}`);
    return response.data;
  },
  update: async (
    eventId: string,
    data: {
      start_ts?: string;
      end_ts?: string;
      title?: string;
      description?: string;
      location?: string;
    }
  ): Promise<{ event: Event }> => {
    const response = await apiClient.patch(`/events/${eventId}`, data);
    return response.data;
  },
  delete: async (eventId: string): Promise<void> => {
    await apiClient.delete(`/events/${eventId}`);
  },
};