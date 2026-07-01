import AccountMenu from '../layout/AccountMenu';
import './AdminLayout.css';

export default function AdminHeader() {
  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <div className="admin-header-logo">R</div>
        <div className="admin-header-brand">
          <span className="admin-header-site">RYD Platform</span>
          <span className="admin-header-badge">Admin Console</span>
        </div>
      </div>

      <div className="admin-header-right">
        <AccountMenu />
      </div>
    </header>
  );
}
