import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import './AdminLayout.css';

export default function AdminLayout({ activeSection, onNavigate, children }) {
  return (
    <div className="admin-layout">
      <AdminHeader />
      <div className="admin-layout-body">
        <AdminSidebar activeSection={activeSection} onNavigate={onNavigate} />
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
