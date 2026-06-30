import { useEffect, useState } from 'react';
import './CoachLayout.css';

const USERS_SUB_ITEMS = [
  { id: 'coachees', label: 'Coachees' },
  { id: 'user-maintenance', label: 'User Maintenance' },
];

export default function CoachSidebar({ activeSection, onNavigate }) {
  const [usersOpen, setUsersOpen] = useState(
    activeSection === 'coachees',
  );

  useEffect(() => {
    if (activeSection === 'coachees') {
      setUsersOpen(true);
    }
  }, [activeSection]);

  const handleUsersSubClick = (id) => {
    if (id === 'coachees') {
      onNavigate('coachees');
    }
  };

  return (
    <aside className="coach-sidebar">
      <nav className="coach-sidebar-nav">
        <button
          type="button"
          className={`coach-sidebar-item ${activeSection === 'dashboard' ? 'active' : ''}`}
          onClick={() => onNavigate('dashboard')}
        >
          Dashboard
        </button>

        <button
          type="button"
          className={`coach-sidebar-item ${activeSection === 'builder' ? 'active' : ''}`}
          onClick={() => onNavigate('builder')}
        >
          Builder
        </button>

        <div className="coach-sidebar-group">
          <button
            type="button"
            className={`coach-sidebar-item coach-sidebar-item--parent ${usersOpen ? 'open' : ''}`}
            onClick={() => setUsersOpen((open) => !open)}
            aria-expanded={usersOpen}
          >
            <span>Users</span>
            <span className="coach-sidebar-chevron" aria-hidden>
              {usersOpen ? '▾' : '▸'}
            </span>
          </button>

          {usersOpen && (
            <div className="coach-sidebar-subnav">
              {USERS_SUB_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`coach-sidebar-subitem ${
                    item.id === 'coachees' && activeSection === 'coachees' ? 'active' : ''
                  }`}
                  onClick={() => handleUsersSubClick(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
