import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import { StoreSettingsProvider, useStoreSettings } from './contexts/StoreSettingsContext';
import { HelmetProvider } from 'react-helmet-async';
import LoadingSpinner from './components/LoadingSpinner'; // ✅ ADD LOADING COMPONENT
import AboutUsPage from './pages/AboutUsPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import Index from './pages/Index';
import ProductsPage from './pages/ProductsPage';
import ProductPage from './pages/ProductPage';
import ConfirmationPage from './pages/ConfirmationPage';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';
import NotFound from './pages/NotFound';
import ThemeInjector from './components/ThemeInjector ';


import './App.css';

// ✅ OPTIMIZE QUERY CLIENT
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// ✅ INTERNAL APP CONTENT COMPONENT THAT USES STORE SETTINGS
const AppContent = () => {
  const { loading } = useStoreSettings();

  // Implement loading gate - don't render main app until settings are loaded
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          <Route path="/" element={<MainLayout><Index /></MainLayout>} />
          <Route path="/products/:typeId" element={<MainLayout><ProductsPage /></MainLayout>} />
          <Route path="/products/:typeId/:productId" element={<MainLayout><ProductPage /></MainLayout>} />
          <Route path="/confirmation" element={<MainLayout><ConfirmationPage /></MainLayout>} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
};

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>

          <StoreSettingsProvider>
            <ThemeInjector />
            <AppContent />
          </StoreSettingsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;