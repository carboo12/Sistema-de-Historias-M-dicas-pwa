import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, GuestOnly, RequireAuth } from './auth/AuthProvider';
import { AppShell } from './components/AppShell';
import { AgendaPage } from './pages/AgendaPage';
import { HelpPage } from './pages/HelpPage';
import { ConsultationPage } from './pages/ConsultationPage';
import { ConsultationsPage } from './pages/ConsultationsPage';
import { LoginPage } from './pages/LoginPage';
import { NewConsultationPage } from './pages/NewConsultationPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PatientDetailPage } from './pages/PatientDetailPage';
import { PatientsPage } from './pages/PatientsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { OfflineSyncManager } from './components/OfflineSyncManager';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 0,
      gcTime: 0,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: 'always'
    }
  }
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <OfflineSyncManager />
          <Routes>
            <Route
              path="/login"
              element={
                <GuestOnly>
                  <LoginPage />
                </GuestOnly>
              }
            />
            <Route
              element={
                <RequireAuth>
                  <AppShell />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="/agenda" replace />} />
              <Route path="/agenda" element={<AgendaPage />} />
              <Route path="/pacientes" element={<PatientsPage />} />
              <Route path="/pacientes/:id" element={<PatientDetailPage />} />
              <Route path="/consultas" element={<ConsultationsPage />} />
              <Route path="/consultas/nueva" element={<NewConsultationPage />} />
              <Route path="/consultas/:id" element={<ConsultationPage />} />
              <Route path="/reportes" element={<ReportsPage />} />
              <Route path="/configuracion" element={<SettingsPage />} />
              <Route path="/ayuda" element={<HelpPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
