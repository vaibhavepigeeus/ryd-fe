import { useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CoacheeDashboard from './pages/CoacheeDashboard';
import CoachApp from './CoachApp';
import './pages/AuthPages.css';

function AuthLoading() {
  return <div className="auth-loading">Loading...</div>;
}

export default function AppRouter({ authRoute, onAuthNavigate }) {
  const { user, loading, isCoach, isCoachee } = useAuth();

  useEffect(() => {
    if (user && (authRoute === 'login' || authRoute === 'register')) {
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

  if (!user) {
    return <LoginPage onNavigate={onAuthNavigate} />;
  }

  if (isCoachee) {
    return <CoacheeDashboard />;
  }

  if (isCoach) {
    return <CoachApp />;
  }

  return <LoginPage onNavigate={onAuthNavigate} />;
}
