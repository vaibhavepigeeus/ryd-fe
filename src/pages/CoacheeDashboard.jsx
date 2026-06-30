import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function CoacheeDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="coachee-dashboard">
      <header className="coachee-header">
        <div className="coachee-header-brand">
          <div className="coachee-header-logo">R</div>
          <h1>RYD Coachee Portal</h1>
        </div>
        <div className="coachee-header-actions">
          <span className="coachee-user-badge">{user?.role}</span>
          <button type="button" className="coachee-logout-btn" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <main className="coachee-main">
        <div className="coachee-welcome-card">
          <h2>Hello, {user?.user_name}</h2>
          <p>
            Welcome to your coachee portal. Your coach will share assessment links with you
            when they are ready. Check your email for published form links from your coach.
          </p>
          {user?.coach_name && (
            <div className="coachee-coach-info">
              Your coach: <strong>{user.coach_name}</strong>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
