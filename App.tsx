import React from 'react';
import { AuthProvider, AppointmentProvider, useAuth } from './store';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';

const AppContent: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <AppointmentProvider>
      <Dashboard />
    </AppointmentProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}