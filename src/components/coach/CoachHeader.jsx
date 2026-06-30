import { useAuth } from '../../context/AuthContext';
import './CoachLayout.css';

export default function CoachHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="coach-header">
      <div className="coach-header-left">
        <div className="coach-header-logo">R</div>
        <span className="coach-header-site">RYD Coach</span>
      </div>

      <div className="coach-header-right">
        <span className="coach-header-user">{user?.user_name}</span>
        <button type="button" className="coach-header-logout" onClick={logout}>
          Log out
        </button>
      </div>
    </header>
  );
}
