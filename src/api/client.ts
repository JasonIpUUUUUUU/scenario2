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

export type FriendshipStatus = 'pending' | 'accepted' | 'declined';
export type FriendshipDirection = 'incoming' | 'outgoing';

export interface UserSearchResult {
  id: string;
  email: string;
  name: string;
  time_zone: string;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  direction: FriendshipDirection;
  other_user: UserSearchResult;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = 'http://8.208.53.133:8000/api/v1';

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
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    if (error.response?.status === 401 && !isLoginRequest) {
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
  search: async (
    q: string,
    params?: { limit?: number }
  ): Promise<{ users: UserSearchResult[] }> => {
    const response = await apiClient.get('/users/search', { params: { q, ...params } });
    return response.data;
  },

  updateMe: async (data: Partial<User> & { password?: string }): Promise<{ user: User }> => {
    const response = await apiClient.patch('/users/me', data);
    return response.data;
  },
};

export const friendsApi = {
  list: async (params?: { limit?: number; offset?: number }): Promise<{ friends: Friendship[] }> => {
    const response = await apiClient.get('/friends', { params });
    return response.data;
  },

  listRequests: async (params?: {
    direction?: FriendshipDirection | 'all';
    limit?: number;
    offset?: number;
  }): Promise<{ requests: Friendship[] }> => {
    const response = await apiClient.get('/friends/requests', { params });
    return response.data;
  },

  sendRequest: async (data: { user_id: string }): Promise<{ friendship: Friendship }> => {
    const response = await apiClient.post('/friends/requests', data);
    return response.data;
  },

  respondToRequest: async (
    friendshipId: string,
    data: { status: 'accepted' | 'declined' }
  ): Promise<{ friendship: Friendship }> => {
    const response = await apiClient.patch(`/friends/requests/${friendshipId}`, data);
    return response.data;
  },

  remove: async (friendshipId: string): Promise<void> => {
    await apiClient.delete(`/friends/${friendshipId}`);
  },
};

// Groups API
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
