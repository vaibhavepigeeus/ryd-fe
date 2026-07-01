import { DashboardIcon, FormsIcon } from '../admin/AdminIcons';
import '../admin/AdminLayout.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { id: 'assessments', label: 'Assessments', Icon: FormsIcon },
];

export default function CoacheeSidebar({ activeSection = 'dashboard', onNavigate }) {
  return (
    <aside className="admin-sidebar">
      <span className="admin-sidebar-label">Navigation</span>
      <nav className="admin-sidebar-nav">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`admin-sidebar-item ${activeSection === id ? 'active' : ''}`}
            onClick={() => onNavigate?.(id)}
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
