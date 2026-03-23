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
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { useAuthStore } from './store/authStore';
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
      <Center h="100vh" bg="#0f0e0d">
        <Spinner size="xl" color="#d4775c" textDecorationThickness="4px" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <div className="min-h-screen bg-base flex items-center justify-center p-6 relative noise-texture">
        <div
          className="w-[96%] max-w-[1680px] h-[92vh] bg-surface rounded-[32px] border border-border-medium flex overflow-hidden relative"
          style={{
            boxShadow: '0 0 0 1px rgba(255,245,230,0.03), 0 40px 80px -20px rgba(0,0,0,0.6)',
          }}
        >
          <Sidebar activeView={activeView} onNavigate={setActiveView} />
          <main className="flex-1 flex flex-col overflow-hidden">
            {activeView === 'calendar' && <Calendar />}
            {activeView === 'groups' && <GroupView />}
            {activeView === 'home' && <Calendar />}
            {activeView === 'settings' && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-display text-text-primary mb-2">Settings</h2>
                  <p className="text-text-secondary">Coming soon...</p>
                  <button
                    onClick={() => {
                      logout();
                      window.location.href = '/login';
                    }}
                    className="mt-4 px-4 py-2 bg-accent hover:bg-accent-hover rounded-lg text-white transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
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