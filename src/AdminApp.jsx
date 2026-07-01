import { useCallback, useEffect, useState } from 'react';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminCoachFormsPage from './pages/AdminCoachFormsPage';
import AdminCoachCoacheesPage from './pages/AdminCoachCoacheesPage';

function parseAdminRoute() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';

  if (path === '/users') {
    return { section: 'users' };
  }
  if (path === '/coach-forms') {
    return { section: 'coach-forms' };
  }
  if (path === '/coach-coachees') {
    return { section: 'coach-coachees' };
  }

  return { section: 'dashboard' };
}

function getPathForRoute(section) {
  if (section === 'users') return '/users';
  if (section === 'coach-forms') return '/coach-forms';
  if (section === 'coach-coachees') return '/coach-coachees';
  return '/';
}

export default function AdminApp() {
  const [route, setRoute] = useState(parseAdminRoute);

  const navigate = useCallback((section) => {
    const path = getPathForRoute(section);
    window.history.pushState({}, '', path);
    setRoute({ section });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseAdminRoute());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  let content = <AdminDashboard onNavigate={navigate} />;

  if (route.section === 'users') {
    content = <AdminUsersPage />;
  } else if (route.section === 'coach-forms') {
    content = <AdminCoachFormsPage />;
  } else if (route.section === 'coach-coachees') {
    content = <AdminCoachCoacheesPage />;
  }

  return (
    <AdminLayout activeSection={route.section} onNavigate={navigate}>
      {content}
    </AdminLayout>
  );
}
