import { useCallback, useEffect, useState } from 'react';
import AdminCreateCoacheeModal from '../components/AdminCreateCoacheeModal';
import CreateCoachModal from '../components/CreateCoachModal';
import {
  createAdminCoach,
  createAdminCoachee,
  fetchAdminCoaches,
} from '../services/adminApi';
import '../components/admin/AdminLayout.css';

export default function AdminUsersPage() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [showCoacheeModal, setShowCoacheeModal] = useState(false);
  const [creatingCoach, setCreatingCoach] = useState(false);
  const [creatingCoachee, setCreatingCoachee] = useState(false);

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

  const handleCreateCoach = async ({ userName, email }) => {
    setCreatingCoach(true);
    setError(null);
    try {
      const data = await createAdminCoach({ userName, email });
      setSuccessMessage(data.message || 'Coach created successfully.');
      setShowCoachModal(false);
      await loadCoaches();
    } catch (err) {
      const message = err.message || 'Failed to create coach';
      setError(message);
      throw new Error(message);
    } finally {
      setCreatingCoach(false);
    }
  };

  const handleCreateCoachee = async ({ userName, email, coachId }) => {
    setCreatingCoachee(true);
    setError(null);
    try {
      const data = await createAdminCoachee({ userName, email, coachId });
      setSuccessMessage(data.message || 'Coachee created successfully.');
      setShowCoacheeModal(false);
      await loadCoaches();
    } catch (err) {
      const message = err.message || 'Failed to create coachee';
      setError(message);
      throw new Error(message);
    } finally {
      setCreatingCoachee(false);
    }
  };

  const activeCoaches = coaches.filter((coach) => coach.status === 'Active');

  return (
    <div className="admin-page">
      <div className="admin-page-hero">
        <h1>User Management</h1>
        <p className="admin-page-subtitle">
          Create new coach and coachee accounts for the platform.
        </p>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <h2>All coaches</h2>
          <div className="admin-panel-actions">
            <button
              type="button"
              className="admin-btn"
              onClick={() => {
                setSuccessMessage('');
                setShowCoachModal(true);
              }}
            >
              Create coach
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--secondary"
              onClick={() => {
                setSuccessMessage('');
                setShowCoacheeModal(true);
              }}
              disabled={activeCoaches.length === 0}
            >
              Create coachee
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="admin-alert admin-alert--success">{successMessage}</div>
        )}

        {error && <p className="admin-alert admin-alert--error">{error}</p>}

        {loading && <p className="admin-loading-dots">Loading coaches</p>}

        {!loading && coaches.length === 0 && (
          <div className="admin-empty">
            <p>No coaches exist yet. Create your first coach to get started.</p>
          </div>
        )}

        {!loading && coaches.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Forms</th>
                  <th>Coachees</th>
                </tr>
              </thead>
              <tbody>
                {coaches.map((coach) => (
                  <tr key={coach.id}>
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
                    <td>{coach.coachee_count ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showCoachModal && (
        <CreateCoachModal
          saving={creatingCoach}
          onSave={handleCreateCoach}
          onClose={() => {
            if (!creatingCoach) setShowCoachModal(false);
          }}
        />
      )}

      {showCoacheeModal && (
        <AdminCreateCoacheeModal
          coaches={activeCoaches}
          saving={creatingCoachee}
          onSave={handleCreateCoachee}
          onClose={() => {
            if (!creatingCoachee) setShowCoacheeModal(false);
          }}
        />
      )}
    </div>
  );
}
