import { useCallback, useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './AppRouter';

function getAuthRouteFromPath() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';

  if (path === '/login') return 'login';
  if (path === '/register') return 'register';
  if (path === '/forgot-password') return 'forgot-password';
  if (path === '/verify-otp') return 'verify-otp';
  if (path === '/create-password') return 'create-password';
  return null;
}

export default function App() {
  const [authRoute, setAuthRoute] = useState(getAuthRouteFromPath);

  const onAuthNavigate = useCallback((route) => {
    const paths = {
      login: '/login',
      register: '/register',
      'forgot-password': '/forgot-password',
      'verify-otp': '/verify-otp',
      'create-password': '/create-password',
    };
    const path = paths[route] || '/login';
    window.history.pushState({}, '', path);
    setAuthRoute(route);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setAuthRoute(getAuthRouteFromPath());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <AuthProvider>
      <AppRouter authRoute={authRoute} onAuthNavigate={onAuthNavigate} />
    </AuthProvider>
  );
}
