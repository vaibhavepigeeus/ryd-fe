import { useCallback, useEffect, useState } from 'react';
import { fetchMyCoachees } from '../services/coacheesApi';
import './CoachCoacheesPage.css';

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

export default function CoachCoacheesPage() {
  const [coachees, setCoachees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCoachees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMyCoachees();
      setCoachees(data.coachees || []);
    } catch (err) {
      setError(err.message || 'Failed to load coachees');
      setCoachees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoachees();
  }, [loadCoachees]);

  return (
    <div className="coach-coachees">
      <div className="coach-coachees-hero">
        <h1>Coachees</h1>
        <p className="coach-coachees-subtitle">
          All coachees linked to your coach account.
        </p>
      </div>

      <section className="coach-coachees-section">
        <div className="coach-coachees-header">
          <h2>Your coachees</h2>
          <span className="coach-coachees-count">
            {coachees.length} coachee{coachees.length === 1 ? '' : 's'}
          </span>
        </div>

        {loading && <p className="coach-coachees-message">Loading coachees...</p>}
        {error && <p className="coach-coachees-error">{error}</p>}

        {!loading && !error && coachees.length === 0 && (
          <div className="coach-coachees-empty">
            <p>No coachees are linked to your account yet.</p>
          </div>
        )}

        {!loading && !error && coachees.length > 0 && (
          <div className="coach-coachees-table-wrap">
            <table className="coach-coachees-table">
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
                    <td className="coach-coachees-name">{coachee.user_name}</td>
                    <td>{coachee.email}</td>
                    <td>
                      <span
                        className={`coach-coachees-status ${
                          coachee.status === 'Active' ? 'active' : 'inactive'
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
      </section>
    </div>
  );
}
