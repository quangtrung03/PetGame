import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EconomicProvider } from './context/EconomicContext';
import { ToastProvider } from './context/ToastContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/ToastContainer';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy loaded components
import { 
  Home,
  Login, 
  Register,
  Dashboard,
  Pets,
  Shop,
  MiniGames,
  DailyMissions,
  Friends,
  Help,
  preloadCriticalComponents
} from './components/LazyComponents';

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  // Preload critical components after app starts
  useEffect(() => {
    preloadCriticalComponents();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <EconomicProvider>
          <ToastProvider>
            <Router>
              <div className="min-h-screen bg-gray-50">
                <Navbar />
                <Suspense fallback={<LoadingSpinner />}>
              
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pets"
                  element={
                    <ProtectedRoute>
                      <Pets />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/shop"
                  element={
                    <ProtectedRoute>
                      <Shop />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/daily-missions"
                  element={
                    <ProtectedRoute>
                      <DailyMissions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/friends"
                  element={
                    <ProtectedRoute>
                      <Friends />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/minigames"
                  element={
                    <ProtectedRoute>
                      <MiniGames />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/help"
                  element={<Help />}
                />
                {/* Redirect unknown routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              </Suspense>
              
              {/* Toast Container */}
              <ToastContainer />
            </div>
          </Router>
        </ToastProvider>
      </EconomicProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
