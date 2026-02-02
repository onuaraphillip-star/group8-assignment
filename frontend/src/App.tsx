import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { HelmetProvider } from 'react-helmet-async';
import { useAuth } from './hooks/useAuth';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { MainApp } from './pages/MainApp';
import { UserProfile } from './pages/UserProfile';
import { Documentation } from './pages/Documentation';
import { Learn } from './pages/Learn';
import { Lesson } from './pages/Lesson';
import { NotFound } from './pages/NotFound';

// Wrapper component to handle auth state changes
function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/app" replace /> : <LoginPage />} 
      />
      <Route 
        path="/signup" 
        element={isAuthenticated ? <Navigate to="/app" replace /> : <SignupPage />} 
      />

      {/* Protected routes */}
      <Route 
        path="/app/*" 
        element={isAuthenticated ? <MainApp /> : <Navigate to="/login" replace />} 
      />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/docs" element={<Documentation />} />
      <Route path="/learn" element={<Learn />} />
      <Route path="/learn/:lessonId" element={<Lesson />} />
      
      {/* Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthWrapper>
          <AppRoutes />
          <Toaster position="top-right" richColors /> 
        </AuthWrapper>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
