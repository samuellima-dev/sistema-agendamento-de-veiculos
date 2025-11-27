export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Appointment {
  id: string;
  leadName: string;
  phone: string;
  date: Date; 
  model: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  googleEventId?: string; // ID for Google Calendar sync
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}