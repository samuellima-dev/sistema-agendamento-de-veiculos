import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Appointment } from './types';

declare global {
  interface Window {
    google: any;
  }
}

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('driveflow_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (email: string) => {
    const fakeUser: User = {
      id: '1',
      name: 'Gerente de Vendas',
      email: email,
      avatar: 'https://picsum.photos/200'
    };
    setUser(fakeUser);
    localStorage.setItem('driveflow_user', JSON.stringify(fakeUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('driveflow_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// --- Appointment Context ---
interface AppointmentContextType {
  appointments: Appointment[];
  addAppointment: (appt: Omit<Appointment, 'id' | 'status'>) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  getAppointmentsByDate: (date: Date) => Appointment[];
  isGoogleConnected: boolean;
  googleClientId: string | null;
  setGoogleClientId: (id: string) => void;
  connectGoogleCalendar: () => void;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    leadName: 'Ana Silva',
    phone: '(11) 99999-1234',
    date: new Date(new Date().setHours(10, 0, 0, 0)), 
    model: 'BMW 320i',
    status: 'scheduled',
    notes: 'Interessada em opções de financiamento.'
  },
  {
    id: '2',
    leadName: 'Roberto Santos',
    phone: '(11) 98888-5678',
    date: new Date(new Date().setHours(14, 30, 0, 0)), 
    model: 'Tesla Model 3',
    status: 'scheduled',
    notes: 'Troca de veículo (Civic 2018).'
  },
  {
    id: '3',
    leadName: 'Carlos Oliveira',
    phone: '(21) 97777-9999',
    date: new Date(new Date().setDate(new Date().getDate() + 1)), 
    model: 'Jeep Compass',
    status: 'scheduled'
  }
];

export const AppointmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [googleClientId, setGoogleClientIdState] = useState<string | null>(null);
  const [tokenClient, setTokenClient] = useState<any>(null);

  // Initialize Data
  useEffect(() => {
    const stored = localStorage.getItem('driveflow_appointments');
    if (stored) {
      const parsed = JSON.parse(stored).map((a: any) => ({
        ...a,
        date: new Date(a.date)
      }));
      setAppointments(parsed);
    } else {
      setAppointments(MOCK_APPOINTMENTS);
    }
    
    // Check local storage for google configs
    const storedToken = localStorage.getItem('google_access_token');
    if (storedToken) setGoogleAccessToken(storedToken);

    const storedClientId = localStorage.getItem('google_client_id');
    if (storedClientId) {
      setGoogleClientIdState(storedClientId);
      // Try to init client if script is loaded
      if (window.google) initGoogleClient(storedClientId);
    }
  }, []);

  const saveToStorage = (newData: Appointment[]) => {
    localStorage.setItem('driveflow_appointments', JSON.stringify(newData));
  };

  const setGoogleClientId = (id: string) => {
    setGoogleClientIdState(id);
    localStorage.setItem('google_client_id', id);
    initGoogleClient(id);
  };

  const initGoogleClient = (clientId: string) => {
    if (!window.google) return;
    
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/calendar.events',
        callback: (tokenResponse: any) => {
          if (tokenResponse.access_token) {
            setGoogleAccessToken(tokenResponse.access_token);
            localStorage.setItem('google_access_token', tokenResponse.access_token);
            console.log('Google Access Token obtido com sucesso.');
          }
        },
      });
      setTokenClient(client);
    } catch (e) {
      console.error("Erro ao inicializar Google Client:", e);
    }
  };

  const connectGoogleCalendar = () => {
    if (tokenClient) {
      // This opens the Google Popup
      tokenClient.requestAccessToken();
    } else if (googleClientId && window.google) {
      // Re-init and try again
      initGoogleClient(googleClientId);
      setTimeout(() => {
         if (tokenClient) tokenClient.requestAccessToken();
      }, 500);
    } else {
      console.warn("Client ID não configurado ou API do Google não carregada.");
    }
  };

  const syncToGoogle = async (action: 'create' | 'update' | 'delete', appointment: Appointment) => {
    if (!googleAccessToken) return null;

    try {
      const event = {
        summary: `Test Drive: ${appointment.model} - ${appointment.leadName}`,
        description: `Cliente: ${appointment.leadName}\nTelefone: ${appointment.phone}\nObs: ${appointment.notes || '-'}`,
        start: { dateTime: appointment.date.toISOString() },
        end: { dateTime: new Date(appointment.date.getTime() + 60 * 60 * 1000).toISOString() },
      };

      let url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
      let method = 'POST';

      if (action === 'update' && appointment.googleEventId) {
        url += `/${appointment.googleEventId}`;
        method = 'PATCH';
      } else if (action === 'delete' && appointment.googleEventId) {
        url += `/${appointment.googleEventId}`;
        method = 'DELETE';
      }

      const options: RequestInit = {
        method,
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
          'Content-Type': 'application/json'
        }
      };

      if (action !== 'delete') {
        options.body = JSON.stringify(event);
      }

      const response = await fetch(url, options);
      
      if (response.status === 401) {
        // Token expired
        setGoogleAccessToken(null);
        localStorage.removeItem('google_access_token');
        alert("Sessão do Google expirou. Por favor, conecte novamente.");
        return null;
      }

      if (!response.ok) {
        throw new Error(`Google API Error: ${response.statusText}`);
      }

      if (action === 'delete') return null;
      
      const data = await response.json();
      return data.id;

    } catch (error) {
      console.error("Erro ao sincronizar com Google Agenda:", error);
      return null;
    }
  };

  const addAppointment = async (appt: Omit<Appointment, 'id' | 'status'>) => {
    const tempId = Math.random().toString(36).substr(2, 9);
    let newAppt: Appointment = {
      ...appt,
      id: tempId,
      status: 'scheduled'
    };

    // Optimistic Update
    let updated = [...appointments, newAppt];
    setAppointments(updated);
    saveToStorage(updated);

    // Sync
    if (googleAccessToken) {
        const googleId = await syncToGoogle('create', newAppt);
        if (googleId) {
            newAppt.googleEventId = googleId;
            updated = updated.map(a => a.id === tempId ? newAppt : a);
            setAppointments(updated);
            saveToStorage(updated);
        }
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    const currentAppt = appointments.find(a => a.id === id);
    if (!currentAppt) return;

    const mergedAppt = { ...currentAppt, ...updates };

    const updatedList = appointments.map(appt => 
      appt.id === id ? mergedAppt : appt
    );
    setAppointments(updatedList);
    saveToStorage(updatedList);

    if (googleAccessToken) {
        await syncToGoogle('update', mergedAppt);
    }
  };

  const deleteAppointment = async (id: string) => {
    const apptToDelete = appointments.find(a => a.id === id);
    
    const updated = appointments.filter(appt => appt.id !== id);
    setAppointments(updated);
    saveToStorage(updated);

    if (googleAccessToken && apptToDelete) {
        await syncToGoogle('delete', apptToDelete);
    }
  };

  const getAppointmentsByDate = (date: Date) => {
    return appointments.filter(appt => 
      appt.date.getDate() === date.getDate() &&
      appt.date.getMonth() === date.getMonth() &&
      appt.date.getFullYear() === date.getFullYear()
    ).sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  return (
    <AppointmentContext.Provider value={{ 
        appointments, 
        addAppointment, 
        updateAppointment, 
        deleteAppointment, 
        getAppointmentsByDate,
        isGoogleConnected: !!googleAccessToken,
        googleClientId,
        setGoogleClientId,
        connectGoogleCalendar
    }}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (!context) throw new Error('useAppointments must be used within an AppointmentProvider');
  return context;
};