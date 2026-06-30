import { useCallback, useEffect, useState } from 'react';
import BuilderApp from './BuilderApp';
import CoachLayout from './components/coach/CoachLayout';
import CoachDashboard from './pages/CoachDashboard';
import CoachCoacheesPage from './pages/CoachCoacheesPage';

function parseCoachRoute() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';

  const builderResponsesMatch = path.match(/^\/builder\/responses\/(\d+)$/);
  if (builderResponsesMatch) {
    return {
      section: 'builder',
      responsePageId: Number(builderResponsesMatch[1]),
    };
  }

  if (path === '/builder') {
    return { section: 'builder', responsePageId: null };
  }

  if (path === '/coachees') {
    return { section: 'coachees', responsePageId: null };
  }

  return { section: 'dashboard', responsePageId: null };
}

function getPathForRoute(section, responsePageId = null) {
  if (section === 'builder' && responsePageId) {
    return `/builder/responses/${responsePageId}`;
  }
  if (section === 'builder') return '/builder';
  if (section === 'coachees') return '/coachees';
  return '/';
}

export default function CoachApp() {
  const [route, setRoute] = useState(parseCoachRoute);

  const navigate = useCallback((section, responsePageId = null) => {
    const path = getPathForRoute(section, responsePageId);
    window.history.pushState({}, '', path);
    setRoute({ section, responsePageId });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseCoachRoute());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (route.section === 'builder') {
    return (
      <BuilderApp
        onExit={() => navigate('dashboard')}
        initialTab={route.responsePageId ? 'Responses' : 'Build'}
        initialResponsePageId={route.responsePageId}
      />
    );
  }

  let content = (
    <CoachDashboard
      onOpenBuilder={() => navigate('builder')}
      onOpenResponses={(pageId) => navigate('builder', pageId)}
    />
  );

  if (route.section === 'coachees') {
    content = <CoachCoacheesPage />;
  }

  return (
    <CoachLayout activeSection={route.section} onNavigate={navigate}>
      {content}
    </CoachLayout>
  );
}
