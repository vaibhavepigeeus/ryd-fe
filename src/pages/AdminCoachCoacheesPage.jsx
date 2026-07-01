import { useCallback, useEffect, useState } from 'react';
import { fetchAdminCoaches, fetchCoachCoachees } from '../services/adminApi';
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

export default function AdminCoachCoacheesPage() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [coachees, setCoachees] = useState([]);
  const [coacheesLoading, setCoacheesLoading] = useState(false);
  const [coacheesError, setCoacheesError] = useState(null);

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
    setCoachees([]);
    setCoacheesError(null);
    setCoacheesLoading(true);
    try {
      const data = await fetchCoachCoachees(coach.id);
      setCoachees(data.coachees || []);
      setSelectedCoach(data.coach || coach);
    } catch (err) {
      setCoacheesError(err.message || 'Failed to load coachees');
    } finally {
      setCoacheesLoading(false);
    }
  };

  const closePanel = () => {
    setSelectedCoach(null);
    setCoachees([]);
    setCoacheesError(null);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-hero">
        <h1>Coach Coachees</h1>
        <p className="admin-page-subtitle">
          Browse all coaches and view the coachees assigned to each coach.
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
                  <th>Coachees</th>
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
                    aria-label={`View coachees for ${coach.user_name}`}
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
                    <td>{coach.coachee_count ?? 0}</td>
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
            aria-label={`Coachees for ${selectedCoach.user_name}`}
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
                {coachees.length} coachee{coachees.length === 1 ? '' : 's'}
              </span>

              {coacheesLoading && (
                <p className="admin-loading-dots">Loading coachees</p>
              )}
              {coacheesError && (
                <p className="admin-alert admin-alert--error">{coacheesError}</p>
              )}

              {!coacheesLoading && !coacheesError && coachees.length === 0 && (
                <div className="admin-empty">
                  <p>No coachees are linked to this coach yet.</p>
                </div>
              )}

              {!coacheesLoading && !coacheesError && coachees.length > 0 && (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Linked on</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coachees.map((coachee) => (
                        <tr key={coachee.coachee_id}>
                          <td className="admin-table-name">{coachee.user_name}</td>
                          <td>{coachee.email}</td>
                          <td>
                            <span
                              className={`admin-status ${
                                coachee.status === 'Active'
                                  ? 'admin-status--active'
                                  : 'admin-status--inactive'
                              }`}
                            >
                              {coachee.status}
                            </span>
                          </td>
                          <td>{formatDate(coachee.linked_at)}</td>
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
