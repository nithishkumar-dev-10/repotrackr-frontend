import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { DashboardPage } from './pages/DashboardPage';
import { DeveloperPage } from './pages/DeveloperPage';

// Lazy-load RepoWorkspacePage so Three.js is strictly isolated to /repo/:id
const RepoWorkspacePage = React.lazy(() =>
  import('./pages/RepoWorkspacePage').then(module => ({ default: module.RepoWorkspacePage }))
);

// Route guard for protected pages
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#3B5BFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Route guard for auth pages (redirect away if already logged in)
const PublicAuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#3B5BFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  const location = useLocation();

  // Hide top navbar on split-screen auth pages for immersive layout
  const hideNavbar = ['/login', '/signup'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col font-sans">
      {!hideNavbar && <Navbar />}

      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="flex-1 flex flex-col"
          >
            <Routes location={location}>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/login"
                element={
                  <PublicAuthRoute>
                    <LoginPage />
                  </PublicAuthRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicAuthRoute>
                    <SignupPage />
                  </PublicAuthRoute>
                }
              />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/repo/:id"
                element={
                  <ProtectedRoute>
                    <React.Suspense
                      fallback={
                        <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center">
                          <div className="w-8 h-8 border-3 border-[#3B5BFF] border-t-transparent rounded-full animate-spin" />
                        </div>
                      }
                    >
                      <RepoWorkspacePage />
                    </React.Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/developer"
                element={
                  <ProtectedRoute>
                    <DeveloperPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
