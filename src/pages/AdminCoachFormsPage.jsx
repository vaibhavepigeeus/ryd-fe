import { useCallback, useEffect, useState } from 'react';
import { fetchAdminCoaches, fetchCoachForms } from '../services/adminApi';
import '../components/admin/AdminLayout.css';
import './AdminCoachPages.css';

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

export default function AdminCoachFormsPage() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [forms, setForms] = useState([]);
  const [formsLoading, setFormsLoading] = useState(false);
  const [formsError, setFormsError] = useState(null);

  const loadCoaches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminCoaches();
      setCoaches(data.coaches || []);
    } catch (err) {
      setError(err.message || 'Failed to load coaches');
      setCoaches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoaches();
  }, [loadCoaches]);

  const openCoachPanel = async (coach) => {
    setSelectedCoach(coach);
    setForms([]);
    setFormsError(null);
    setFormsLoading(true);
    try {
      const data = await fetchCoachForms(coach.id);
      setForms(data.forms || []);
      setSelectedCoach(data.coach || coach);
    } catch (err) {
      setFormsError(err.message || 'Failed to load forms');
    } finally {
      setFormsLoading(false);
    }
  };

  const closePanel = () => {
    setSelectedCoach(null);
    setForms([]);
    setFormsError(null);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-hero">
        <h1>Coach Forms</h1>
        <p className="admin-page-subtitle">
          Browse all coaches and view the forms each coach has created.
        </p>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <h2>All coaches</h2>
          <span className="admin-panel-count">
            {coaches.length} coach{coaches.length === 1 ? '' : 'es'}
          </span>
        </div>

        {loading && <p className="admin-loading-dots">Loading coaches</p>}
        {error && <p className="admin-alert admin-alert--error">{error}</p>}

        {!loading && !error && coaches.length === 0 && (
          <div className="admin-empty">
            <p>No coaches found.</p>
          </div>
        )}

        {!loading && !error && coaches.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Forms</th>
                </tr>
              </thead>
              <tbody>
                {coaches.map((coach) => (
                  <tr
                    key={coach.id}
                    className={`admin-table-row--clickable ${
                      selectedCoach?.id === coach.id ? 'admin-table-row--selected' : ''
                    }`}
                    onClick={() => openCoachPanel(coach)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openCoachPanel(coach);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View forms for ${coach.user_name}`}
                  >
                    <td className="admin-table-name">{coach.user_name}</td>
                    <td>{coach.email}</td>
                    <td>
                      <span
                        className={`admin-status ${
                          coach.status === 'Active'
                            ? 'admin-status--active'
                            : 'admin-status--inactive'
                        }`}
                      >
                        {coach.status}
                      </span>
                    </td>
                    <td>{coach.form_count ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedCoach && (
        <div className="admin-coach-panel-overlay" onClick={closePanel}>
          <div
            className="admin-coach-panel"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Forms by ${selectedCoach.user_name}`}
          >
            <div className="admin-coach-panel-header">
              <div>
                <h2>{selectedCoach.user_name}</h2>
                <p className="admin-coach-panel-subtitle">{selectedCoach.email}</p>
              </div>
              <button
                type="button"
                className="admin-coach-panel-close"
                onClick={closePanel}
                aria-label="Close panel"
              >
                ×
              </button>
            </div>

            <div className="admin-coach-panel-body">
              <span className="admin-coach-panel-count">
                {forms.length} form{forms.length === 1 ? '' : 's'}
              </span>

              {formsLoading && <p className="admin-loading-dots">Loading forms</p>}
              {formsError && <p className="admin-alert admin-alert--error">{formsError}</p>}

              {!formsLoading && !formsError && forms.length === 0 && (
                <div className="admin-empty">
                  <p>This coach has not created any forms yet.</p>
                </div>
              )}

              {!formsLoading && !formsError && forms.length > 0 && (
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
                      {forms.map((form) => (
                        <tr key={form.id}>
                          <td className="admin-table-name">{form.page_name || 'Untitled form'}</td>
                          <td>
                            <span
                              className={`admin-status ${
                                form.is_published ? 'admin-status--active' : 'admin-status--inactive'
                              }`}
                            >
                              {form.is_published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td>{form.submission_count ?? 0}</td>
                          <td>{formatDate(form.updated_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
