import { useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import CreatePasswordPage from './pages/CreatePasswordPage';
import CoacheeDashboard from './pages/CoacheeDashboard';
import CoachApp from './CoachApp';
import AdminApp from './AdminApp';
import './pages/AuthPages.css';

function AuthLoading() {
  return <div className="auth-loading">Loading...</div>;
}

const PUBLIC_AUTH_ROUTES = new Set([
  'login',
  'register',
  'forgot-password',
  'verify-otp',
  'create-password',
]);

export default function AppRouter({ authRoute, onAuthNavigate }) {
  const { user, loading, isAdmin, isCoach, isCoachee } = useAuth();

  useEffect(() => {
    if (user && PUBLIC_AUTH_ROUTES.has(authRoute)) {
      window.history.replaceState({}, '', '/');
    }
  }, [user, authRoute]);

  if (loading) {
    return <AuthLoading />;
  }

  if (authRoute === 'login' && !user) {
    return <LoginPage onNavigate={onAuthNavigate} />;
  }

  if (authRoute === 'register' && !user) {
    return <RegisterPage onNavigate={onAuthNavigate} />;
  }

  if (authRoute === 'forgot-password' && !user) {
    return <ForgotPasswordPage onNavigate={onAuthNavigate} />;
  }

  if (authRoute === 'verify-otp' && !user) {
    return <VerifyOtpPage onNavigate={onAuthNavigate} />;
  }

  if (authRoute === 'create-password' && !user) {
    return <CreatePasswordPage onNavigate={onAuthNavigate} />;
  }

  if (!user) {
    return <LoginPage onNavigate={onAuthNavigate} />;
  }

  if (isAdmin) {
    return <AdminApp />;
  }

  if (isCoachee) {
    return <CoacheeDashboard />;
  }

  if (isCoach) {
    return <CoachApp />;
  }

  return <LoginPage onNavigate={onAuthNavigate} />;
}
