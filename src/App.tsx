import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider, Box, Spinner, Center } from '@chakra-ui/react';
import { system } from './theme';
import { Toaster } from './components/ui/toaster';
import { Calendar } from './components/Calendar';
import { Sidebar } from './components/Sidebar';
import { PendingInvites } from './components/PendingInvites';
import { CreateEventButton } from './components/CreateEventButton';
import { GroupView } from './components/GroupView';
import { CreateEventModal } from './components/CreateEventModal';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { authApi } from './api/client';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

type View = 'home' | 'calendar' | 'groups' | 'settings';

function AppContent() {
  const [activeView, setActiveView] = useState<View>('calendar');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, isAuthenticated, isLoading, setAuth, logout, setLoading } = useAuthStore();
  const { isDarkMode } = useThemeStore();

  // Apply theme to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        setIsInitialized(true);
        return;
      }

      try {
        const response = await authApi.getMe();
        setAuth(response.user, token);
      } catch (error) {
        localStorage.removeItem('token');
        logout();
      } finally {
        setIsInitialized(true);
      }
    };

    checkAuth();
  }, [setAuth, logout, setLoading]);

  if (!isInitialized || isLoading) {
    return (
      <Center h="100vh" bg="var(--bg-primary)">
        <Spinner size="xl" color="#d4775c" textDecorationThickness="4px" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <div className="min-h-screen bg-primary flex items-center justify-center p-6 relative noise-texture">
        <div
          className="w-[96%] max-w-[1680px] h-[92vh] bg-secondary rounded-[32px] border border-border-medium flex overflow-hidden relative"
          style={{
            boxShadow: '0 0 0 1px var(--border-subtle), 0 40px 80px -20px rgba(0,0,0,0.6)',
          }}
        >
          <Sidebar activeView={activeView} onNavigate={setActiveView} />
          <main className="flex-1 flex flex-col overflow-hidden">
            {activeView === 'calendar' && <Calendar />}
            {activeView === 'groups' && <GroupView />}
            {activeView === 'home' && <Calendar />}
            {activeView === 'settings' && <Settings />}
          </main>
          {activeView !== 'groups' && (
            <div className="w-[300px] p-6 flex flex-col gap-5 border-l border-border-subtle">
              <CreateEventButton onClick={() => setIsModalOpen(true)} />
              <PendingInvites />
            </div>
          )}
        </div>
      </div>
      <CreateEventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={system}>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/calendar" element={<AppContent />} />
            <Route path="/" element={<Navigate to="/calendar" replace />} />
          </Routes>
        </BrowserRouter>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;