export interface User {
  id: string;
  email: string;
  name: string;
  time_zone: string;
  created_at: string;
}

export interface Group {
  id: string;
  owner_id: string;
  name: string;
  created_at: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  status: 'applied' | 'invited' | 'active';
  created_at: string;

  user: {
    id: string;
    email: string;
    name: string;
    time_zone: string;
  };
}

export interface Event {
  id: string;
  user_id: string;
  start_ts: string;
  end_ts: string;
  title: string;
  description?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface GroupEvent {
  id: string;
  group_id: string;
  creator_id: string;
  start_ts: string;
  end_ts: string;
  title: string;
  description?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface GroupEventParticipant {
  group_event_id: string;
  user_id: string;
  participant_role: 'required' | 'optional';
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

export interface GroupPrivacy {
  group_id: string;
  user_id: string;
  share_level: number;
  updated_at: string;
}

export interface PreferredPeriod {
  id: string;
  user_id: string;
  group_id: string | null;
  start_ts: string;
  end_ts: string;
  note?: string;
  created_at: string;
}

export interface AvailabilitySlot {
  start: string;
  end: string;
  available_count: number;
  available_users: string[];
  conflicts?: Array<{
    user_id: string;
    event_title: string;
  }>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  time_zone: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}