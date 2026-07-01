import { useCallback, useEffect, useState } from 'react';
import CreateCoacheeModal from '../components/CreateCoacheeModal';
import EditCoacheeModal from '../components/EditCoacheeModal';
import { createCoachee, fetchMyCoachees, updateCoachee } from '../services/coacheesApi';
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingCoachee, setEditingCoachee] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleCreateCoachee = async ({ userName, email }) => {
    setCreating(true);
    setError(null);
    try {
      const data = await createCoachee({ userName, email });
      setSuccessMessage(data.message || 'Coachee created successfully.');
      setShowCreateModal(false);
      await loadCoachees();
    } catch (err) {
      const message = err.message || 'Failed to create coachee';
      setError(message);
      throw new Error(message);
    } finally {
      setCreating(false);
    }
  };

  const openCreateModal = () => {
    setSuccessMessage('');
    setShowCreateModal(true);
  };

  const handleEditCoachee = async ({ coacheeId, userName }) => {
    setSavingEdit(true);
    setError(null);
    try {
      const data = await updateCoachee(coacheeId, { userName });
      setSuccessMessage(data.message || 'Coachee updated successfully.');
      setEditingCoachee(null);
      await loadCoachees();
    } catch (err) {
      const message = err.message || 'Failed to update coachee';
      setError(message);
      throw new Error(message);
    } finally {
      setSavingEdit(false);
    }
  };

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
          <div className="coach-coachees-header-actions">
            <span className="coach-coachees-count">
              {coachees.length} coachee{coachees.length === 1 ? '' : 's'}
            </span>
            <button
              type="button"
              className="coach-coachees-create-btn"
              onClick={openCreateModal}
            >
              Create coachee
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="coach-coachees-success">{successMessage}</div>
        )}

        {loading && <p className="coach-coachees-message">Loading coachees...</p>}
        {error && <p className="coach-coachees-error">{error}</p>}

        {!loading && !error && coachees.length === 0 && (
          <div className="coach-coachees-empty">
            <p>No coachees are linked to your account yet.</p>
            <button
              type="button"
              className="coach-coachees-create-btn coach-coachees-create-btn--empty"
              onClick={openCreateModal}
            >
              Create your first coachee
            </button>
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
                  <th aria-label="Actions" />
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
                    <td className="coach-coachees-actions">
                      <button
                        type="button"
                        className="coach-coachees-edit-btn"
                        onClick={() => {
                          setSuccessMessage('');
                          setEditingCoachee(coachee);
                        }}
                        aria-label={`Edit ${coachee.user_name}`}
                        title="Edit name"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path
                            d="M4 20h4l11-11-4-4L4 16v4z"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M14 6l4 4"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showCreateModal && (
        <CreateCoacheeModal
          saving={creating}
          onSave={handleCreateCoachee}
          onClose={() => {
            if (!creating) setShowCreateModal(false);
          }}
        />
      )}

      {editingCoachee && (
        <EditCoacheeModal
          coachee={editingCoachee}
          saving={savingEdit}
          onSave={handleEditCoachee}
          onClose={() => {
            if (!savingEdit) setEditingCoachee(null);
          }}
        />
      )}
    </div>
  );
}
