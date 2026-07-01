import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ActiveStatIcon,
  CoacheesStatIcon,
  FormsStatIcon,
} from '../components/admin/AdminIcons';
import { fetchPagesWithResponses } from '../services/responsesApi';
import '../components/admin/AdminLayout.css';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getPageTitle(page) {
  return page.page_name || 'Untitled form';
}

const STAT_CARDS = [
  {
    key: 'totalForms',
    label: 'Total forms',
    icon: FormsStatIcon,
    iconClass: 'admin-stat-icon--forms',
  },
  {
    key: 'totalResponses',
    label: 'Total responses',
    icon: CoacheesStatIcon,
    iconClass: 'admin-stat-icon--coachees',
  },
  {
    key: 'publishedForms',
    label: 'Published forms',
    icon: ActiveStatIcon,
    iconClass: 'admin-stat-icon--active',
  },
];

export default function CoachDashboard({ onOpenBuilder, onOpenResponses, onNavigateCoachees }) {
  const { user } = useAuth();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await fetchPagesWithResponses();
      setPages(list);
    } catch (err) {
      setError(err.message || 'Failed to load forms');
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const stats = useMemo(() => {
    const totalForms = pages.length;
    const totalResponses = pages.reduce((sum, page) => sum + (page.submission_count || 0), 0);
    const publishedForms = pages.filter((page) => page.is_published).length;

    return { totalForms, totalResponses, publishedForms };
  }, [pages]);

  const firstName = user?.user_name?.split(' ')[0] || 'Coach';

  return (
    <div className="admin-dashboard">
      <section className="admin-hero">
        <div className="admin-hero-content">
          <span className="admin-hero-eyebrow">Coach dashboard</span>
          <h1>Welcome back, {firstName}</h1>
          <p className="admin-hero-subtitle">
            Here&apos;s an overview of your forms and responses. Use the quick actions
            below to build forms or manage your coachees.
          </p>
        </div>
      </section>

      <h2 className="admin-section-title">Overview</h2>

      <div className="admin-stats-grid coach-stats-grid">
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

      <h2 className="admin-section-title">Quick actions</h2>
      <div className="admin-quick-actions">
        <button type="button" className="admin-quick-action" onClick={onOpenBuilder}>
          <span className="admin-quick-action-icon">
            <FormsStatIcon />
          </span>
          <span className="admin-quick-action-text">
            <strong>Open builder</strong>
            <span>Create and edit your forms</span>
          </span>
        </button>
        {onNavigateCoachees && (
          <button type="button" className="admin-quick-action" onClick={onNavigateCoachees}>
            <span className="admin-quick-action-icon">
              <CoacheesStatIcon />
            </span>
            <span className="admin-quick-action-text">
              <strong>Manage coachees</strong>
              <span>View and add coachees</span>
            </span>
          </button>
        )}
        {pages.length > 0 && (
          <button
            type="button"
            className="admin-quick-action"
            onClick={() => onOpenResponses?.(pages[0].id)}
          >
            <span className="admin-quick-action-icon">
              <ActiveStatIcon />
            </span>
            <span className="admin-quick-action-text">
              <strong>View responses</strong>
              <span>See submissions on your latest form</span>
            </span>
          </button>
        )}
      </div>

      <h2 className="admin-section-title">Your forms</h2>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <h2>All forms</h2>
          <div className="admin-panel-actions">
            <span className="admin-panel-count">
              {pages.length} form{pages.length === 1 ? '' : 's'}
            </span>
            <button type="button" className="admin-btn" onClick={onOpenBuilder}>
              Open builder
            </button>
          </div>
        </div>

        {loading && <p className="admin-loading-dots">Loading forms</p>}
        {error && <p className="admin-alert admin-alert--error">{error}</p>}

        {!loading && !error && pages.length === 0 && (
          <div className="admin-empty">
            <p>You haven&apos;t created any forms yet.</p>
            <button type="button" className="admin-btn coach-empty-cta" onClick={onOpenBuilder}>
              Create your first form
            </button>
          </div>
        )}

        {!loading && !error && pages.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Form name</th>
                  <th>Status</th>
                  <th>Responses</th>
                  <th>Last updated</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr
                    key={page.id}
                    className="admin-table-row--clickable"
                    onClick={() => onOpenResponses?.(page.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onOpenResponses?.(page.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View responses for ${getPageTitle(page)}`}
                  >
                    <td className="admin-table-name">{getPageTitle(page)}</td>
                    <td>
                      <span
                        className={`admin-status ${
                          page.is_published ? 'admin-status--active' : 'admin-status--inactive'
                        }`}
                      >
                        {page.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>{page.submission_count ?? 0}</td>
                    <td>{formatDate(page.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
