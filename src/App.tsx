import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import { StoreSettingsProvider } from './contexts/StoreSettingsContext';
import { HelmetProvider } from 'react-helmet-async';
import { Suspense, lazy } from 'react'; // ✅ ADD SUSPENSE AND LAZY
import LoadingSpinner from './components/LoadingSpinner'; // ✅ ADD LOADING COMPONENT

// ✅ LAZY LOAD ALL PAGES
const Index = lazy(() => import('./pages/Index'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const ConfirmationPage = lazy(() => import('./pages/ConfirmationPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

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

// ✅ CREATE LOADING FALLBACK COMPONENT
const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner />
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StoreSettingsProvider>
            <Router>
              <div className="min-h-screen bg-background text-foreground">
                {/* ✅ WRAP ROUTES IN SUSPENSE */}
                <Suspense fallback={<PageFallback />}>
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
                  </Routes>
                </Suspense>
                <Toaster />
              </div>
            </Router>
          </StoreSettingsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;