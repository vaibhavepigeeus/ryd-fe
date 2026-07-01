import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ActiveStatIcon,
  CoachesStatIcon,
  CoacheesStatIcon,
  FormsStatIcon,
} from '../components/admin/AdminIcons';
import { fetchAdminStats } from '../services/adminApi';
import '../components/admin/AdminLayout.css';

const STAT_CARDS = [
  {
    key: 'total_coaches',
    label: 'Total coaches',
    icon: CoachesStatIcon,
    iconClass: 'admin-stat-icon--coaches',
  },
  {
    key: 'active_coaches',
    label: 'Active coaches',
    icon: ActiveStatIcon,
    iconClass: 'admin-stat-icon--active',
  },
  {
    key: 'total_coachees',
    label: 'Total coachees',
    icon: CoacheesStatIcon,
    iconClass: 'admin-stat-icon--coachees',
  },
  {
    key: 'total_forms',
    label: 'Total forms',
    icon: FormsStatIcon,
    iconClass: 'admin-stat-icon--forms',
  },
];

export default function AdminDashboard({ onNavigate }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard stats');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const firstName = user?.user_name?.split(' ')[0] || 'Admin';

  return (
    <div className="admin-dashboard">
      <section className="admin-hero">
        <div className="admin-hero-content">
          <span className="admin-hero-eyebrow">Admin dashboard</span>
          <h1>Welcome back, {firstName}</h1>
          <p className="admin-hero-subtitle">
            Monitor coaches, coachees, and forms across the platform. Use the quick
            actions below to jump to common tasks.
          </p>
        </div>
      </section>

      <h2 className="admin-section-title">Platform overview</h2>

      {loading && <p className="admin-loading-dots">Loading stats</p>}
      {error && <p className="admin-alert admin-alert--error">{error}</p>}

      {!loading && !error && stats && (
        <div className="admin-stats-grid">
          {STAT_CARDS.map(({ key, label, icon: Icon, iconClass }) => (
            <article key={key} className="admin-stat-card">
              <div className="admin-stat-card-top">
                <span className="admin-stat-label">{label}</span>
                <span className={`admin-stat-icon ${iconClass}`}>
                  <Icon />
                </span>
              </div>
              <strong className="admin-stat-value">{stats[key] ?? 0}</strong>
            </article>
          ))}
        </div>
      )}

      {onNavigate && (
        <>
          <h2 className="admin-section-title">Quick actions</h2>
          <div className="admin-quick-actions">
            <button
              type="button"
              className="admin-quick-action"
              onClick={() => onNavigate('users')}
            >
              <span className="admin-quick-action-icon">
                <CoacheesStatIcon />
              </span>
              <span className="admin-quick-action-text">
                <strong>Manage users</strong>
                <span>Create coaches and coachees</span>
              </span>
            </button>
            <button
              type="button"
              className="admin-quick-action"
              onClick={() => onNavigate('coach-forms')}
            >
              <span className="admin-quick-action-icon">
                <FormsStatIcon />
              </span>
              <span className="admin-quick-action-text">
                <strong>Browse coach forms</strong>
                <span>View forms by coach</span>
              </span>
            </button>
            <button
              type="button"
              className="admin-quick-action"
              onClick={() => onNavigate('coach-coachees')}
            >
              <span className="admin-quick-action-icon">
                <CoachesStatIcon />
              </span>
              <span className="admin-quick-action-text">
                <strong>View coach coachees</strong>
                <span>See coachee assignments</span>
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
