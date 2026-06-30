import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchPagesWithResponses } from '../services/responsesApi';
import './CoachDashboard.css';

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

export default function CoachDashboard({ onOpenBuilder, onOpenResponses }) {
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
    <div className="coach-dashboard">
      <div className="coach-dashboard-hero">
        <div>
          <h1>Welcome back, {firstName}!</h1>
          <p className="coach-dashboard-subtitle">
            Here&apos;s an overview of your forms and responses.
          </p>
        </div>
        <button type="button" className="coach-dashboard-cta" onClick={onOpenBuilder}>
          Open builder
        </button>
      </div>

      <section className="coach-stats">
        <h2>Overview</h2>
        <div className="coach-stats-grid">
          <article className="coach-stat-card">
            <span className="coach-stat-label">Total forms</span>
            <strong className="coach-stat-value">{stats.totalForms}</strong>
          </article>
          <article className="coach-stat-card">
            <span className="coach-stat-label">Total responses</span>
            <strong className="coach-stat-value">{stats.totalResponses}</strong>
          </article>
          <article className="coach-stat-card">
            <span className="coach-stat-label">Published forms</span>
            <strong className="coach-stat-value">{stats.publishedForms}</strong>
          </article>
        </div>
      </section>

      <section className="coach-forms-section">
        <div className="coach-forms-header">
          <h2>Your forms</h2>
          <span className="coach-forms-count">{pages.length} form{pages.length === 1 ? '' : 's'}</span>
        </div>

        {loading && <p className="coach-forms-message">Loading forms...</p>}
        {error && <p className="coach-forms-error">{error}</p>}

        {!loading && !error && pages.length === 0 && (
          <div className="coach-forms-empty">
            <p>You haven&apos;t created any forms yet.</p>
            <button type="button" className="coach-dashboard-cta" onClick={onOpenBuilder}>
              Create your first form
            </button>
          </div>
        )}

        {!loading && !error && pages.length > 0 && (
          <div className="coach-forms-table-wrap">
            <table className="coach-forms-table">
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
                    className="coach-forms-row--clickable"
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
                    <td className="coach-forms-name">{getPageTitle(page)}</td>
                    <td>
                      <span
                        className={`coach-forms-status ${
                          page.is_published ? 'published' : 'draft'
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
