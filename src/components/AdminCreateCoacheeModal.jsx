import { useEffect, useRef, useState } from 'react';
import './layout/PublishModal.css';
import './CreateCoacheeModal.css';

export default function AdminCreateCoacheeModal({
  coaches = [],
  saving = false,
  onSave,
  onClose,
}) {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [coachId, setCoachId] = useState('');
  const [error, setError] = useState('');
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
    if (coaches.length === 1) {
      setCoachId(String(coaches[0].id));
    }
  }, [coaches]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedName = userName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Please enter the coachee name.');
      return;
    }
    if (!trimmedEmail) {
      setError('Please enter the coachee email.');
      return;
    }
    if (!coachId) {
      setError('Please select a coach.');
      return;
    }

    try {
      await onSave({
        userName: trimmedName,
        email: trimmedEmail,
        coachId: Number(coachId),
      });
    } catch (err) {
      setError(err.message || 'Failed to create coachee.');
    }
  };

  return (
    <div className="publish-modal-overlay" onClick={saving ? undefined : onClose}>
      <div className="publish-modal create-coachee-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Create coachee</h2>
        <p>
          Add a new coachee and assign them to a coach. A login password will be emailed to them.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="save-page-modal-label" htmlFor="admin-coachee-name">
            Full name
          </label>
          <input
            id="admin-coachee-name"
            ref={nameRef}
            className="publish-modal-link save-page-modal-input"
            type="text"
            value={userName}
            onChange={(e) => {
              setUserName(e.target.value);
              if (error) setError('');
            }}
            placeholder="Coachee name"
            disabled={saving}
            maxLength={100}
            autoComplete="name"
          />

          <label className="save-page-modal-label" htmlFor="admin-coachee-email">
            Email
          </label>
          <input
            id="admin-coachee-email"
            className="publish-modal-link save-page-modal-input"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            placeholder="coachee@example.com"
            disabled={saving}
            autoComplete="email"
          />

          <label className="save-page-modal-label" htmlFor="admin-coachee-coach">
            Assign to coach
          </label>
          <select
            id="admin-coachee-coach"
            className="publish-modal-link save-page-modal-input"
            value={coachId}
            onChange={(e) => {
              setCoachId(e.target.value);
              if (error) setError('');
            }}
            disabled={saving}
          >
            <option value="">Select a coach</option>
            {coaches.map((coach) => (
              <option key={coach.id} value={coach.id}>
                {coach.user_name}
              </option>
            ))}
          </select>

          {error && <p className="save-page-modal-error">{error}</p>}

          <div className="save-page-modal-actions">
            <button
              type="button"
              className="publish-modal-close save-page-modal-cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="save-page-modal-submit" disabled={saving}>
              {saving ? 'Creating...' : 'Create coachee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
