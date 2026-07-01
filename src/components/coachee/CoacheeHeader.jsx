import AccountMenu from '../layout/AccountMenu';
import '../admin/AdminLayout.css';

export default function CoacheeHeader() {
  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <div className="admin-header-logo">R</div>
        <div className="admin-header-brand">
          <span className="admin-header-site">RYD Platform</span>
          <span className="admin-header-badge">Coachee Portal</span>
        </div>
      </div>

      <div className="admin-header-right">
        <AccountMenu />
      </div>
    </header>
  );
}
