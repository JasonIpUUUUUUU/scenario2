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

const API_BASE_URL = 'http://8.208.53.133:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
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

// Auth API (Public endpoints)
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

// Users API
export const usersApi = {
  updateMe: async (data: Partial<User> & { password?: string }): Promise<{ user: User }> => {
    const response = await apiClient.patch('/users/me', data);
    return response.data;
  },
};

// Groups API
export const groupsApi = {
  // Create a group
  create: async (data: { name: string }): Promise<{ group: Group }> => {
    const response = await apiClient.post('/groups', data);
    return response.data;
  },

  // List groups for current user
  list: async (params?: { limit?: number; offset?: number }): Promise<{ groups: Group[] }> => {
    const response = await apiClient.get('/groups', { params });
    return response.data;
  },

  // Get group by ID
  get: async (groupId: string): Promise<{ group: Group }> => {
    const response = await apiClient.get(`/groups/${groupId}`);
    return response.data;
  },

  // Update group
  update: async (groupId: string, data: { name: string }): Promise<{ group: Group }> => {
    const response = await apiClient.patch(`/groups/${groupId}`, data);
    return response.data;
  },

  // Delete group
  delete: async (groupId: string): Promise<void> => {
    await apiClient.delete(`/groups/${groupId}`);
  },

  // Group Members
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

  // Group Privacy
  getPrivacySettings: async (groupId: string): Promise<{ privacy: GroupPrivacy[] }> => {
    const response = await apiClient.get(`/groups/${groupId}/privacy`);
    return response.data;
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

// Events API (Personal Events)
export const eventsApi = {
  // List personal events
  list: async (params?: {
    start_ts?: string;
    end_ts?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ events: Event[] }> => {
    const response = await apiClient.get('/events', { params });
    return response.data;
  },

  // Create personal event
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

  // Get personal event by ID
  get: async (eventId: string): Promise<{ event: Event }> => {
    const response = await apiClient.get(`/events/${eventId}`);
    return response.data;
  },

  // Update personal event
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

  // Delete personal event
  delete: async (eventId: string): Promise<void> => {
    await apiClient.delete(`/events/${eventId}`);
  },
};

// Group Events API
export const groupEventsApi = {
  // List group events
  list: async (
    groupId: string,
    params?: {
      start_ts?: string;
      end_ts?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ events: GroupEvent[] }> => {
    const response = await apiClient.get(`/groups/${groupId}/events`, { params });
    return response.data;
  },

  // Create group event
  create: async (
    groupId: string,
    data: {
      start_ts: string;
      end_ts: string;
      title: string;
      description?: string;
      location?: string;
    }
  ): Promise<{ event: GroupEvent }> => {
    const response = await apiClient.post(`/groups/${groupId}/events`, data);
    return response.data;
  },

  // Get group event by ID
  get: async (groupId: string, eventId: string): Promise<{ event: GroupEvent }> => {
    const response = await apiClient.get(`/groups/${groupId}/events/${eventId}`);
    return response.data;
  },

  // Update group event
  update: async (
    groupId: string,
    eventId: string,
    data: {
      start_ts?: string;
      end_ts?: string;
      title?: string;
      description?: string;
      location?: string;
    }
  ): Promise<{ event: GroupEvent }> => {
    const response = await apiClient.patch(`/groups/${groupId}/events/${eventId}`, data);
    return response.data;
  },

  // Delete group event
  delete: async (groupId: string, eventId: string): Promise<void> => {
    await apiClient.delete(`/groups/${groupId}/events/${eventId}`);
  },

  // Participants
  getParticipants: async (
    groupId: string,
    eventId: string
  ): Promise<{ participants: GroupEventParticipant[] }> => {
    const response = await apiClient.get(`/groups/${groupId}/events/${eventId}/participants`);
    return response.data;
  },

  addParticipant: async (
    groupId: string,
    eventId: string,
    data: { user_id: string; participant_role: 'required' | 'optional' }
  ): Promise<{ participant: GroupEventParticipant }> => {
    const response = await apiClient.post(
      `/groups/${groupId}/events/${eventId}/participants`,
      data
    );
    return response.data;
  },

  updateParticipant: async (
    groupId: string,
    eventId: string,
    userId: string,
    data: { participant_role?: 'required' | 'optional'; status?: 'pending' | 'accepted' | 'declined' }
  ): Promise<{ participant: GroupEventParticipant }> => {
    const response = await apiClient.patch(
      `/groups/${groupId}/events/${eventId}/participants/${userId}`,
      data
    );
    return response.data;
  },

  removeParticipant: async (groupId: string, eventId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/groups/${groupId}/events/${eventId}/participants/${userId}`);
  },
};

// Preferred Periods API
export const preferredPeriodsApi = {
  // List preferred periods
  list: async (params?: {
    group_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ periods: PreferredPeriod[] }> => {
    const response = await apiClient.get('/preferred-periods', { params });
    return response.data;
  },

  // Create preferred period
  create: async (data: {
    group_id: string | null;
    start_ts: string;
    end_ts: string;
    note?: string;
  }): Promise<{ period: PreferredPeriod }> => {
    const response = await apiClient.post('/preferred-periods', data);
    return response.data;
  },

  // Update preferred period
  update: async (
    periodId: string,
    data: {
      start_ts?: string;
      end_ts?: string;
      note?: string;
    }
  ): Promise<{ period: PreferredPeriod }> => {
    const response = await apiClient.patch(`/preferred-periods/${periodId}`, data);
    return response.data;
  },

  // Delete preferred period
  delete: async (periodId: string): Promise<void> => {
    await apiClient.delete(`/preferred-periods/${periodId}`);
  },
};

// Availability API
export const availabilityApi = {
  // Find matching time slots
  findSlots: async (
    groupId: string,
    params: {
      start_ts: string;
      end_ts: string;
      duration_minutes?: number;
      step_minutes?: number;
      max_results?: number;
      participant_ids?: string[];
      optional_participant_ids?: string[];
    }
  ): Promise<{ slots: AvailabilitySlot[] }> => {
    const response = await apiClient.get(`/groups/${groupId}/availability`, { params });
    return response.data;
  },
};