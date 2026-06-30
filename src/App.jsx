import { useCallback, useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './AppRouter';

function getAuthRouteFromPath() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';

  if (path === '/login') return 'login';
  if (path === '/register') return 'register';
  return null;
}

export default function App() {
  const [authRoute, setAuthRoute] = useState(getAuthRouteFromPath);

  const onAuthNavigate = useCallback((route) => {
    const path = route === 'register' ? '/register' : '/login';
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
