import {
  CoacheesIcon,
  DashboardIcon,
  FormsIcon,
  UsersIcon,
} from './AdminIcons';
import './AdminLayout.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { id: 'users', label: 'User Management', Icon: UsersIcon },
  { id: 'coach-forms', label: 'Coach Forms', Icon: FormsIcon },
  { id: 'coach-coachees', label: 'Coach Coachees', Icon: CoacheesIcon },
];

export default function AdminSidebar({ activeSection, onNavigate }) {
  return (
    <aside className="admin-sidebar">
      <span className="admin-sidebar-label">Navigation</span>
      <nav className="admin-sidebar-nav">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`admin-sidebar-item ${activeSection === id ? 'active' : ''}`}
            onClick={() => onNavigate(id)}
          >
            <span className="admin-sidebar-icon">
              <Icon />
            </span>
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
