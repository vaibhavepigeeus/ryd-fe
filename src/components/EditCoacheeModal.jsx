import { useEffect, useRef, useState } from 'react';
import './layout/PublishModal.css';
import './CreateCoacheeModal.css';

export default function EditCoacheeModal({
  coachee,
  saving = false,
  onSave,
  onClose,
}) {
  const [userName, setUserName] = useState(coachee?.user_name || '');
  const [error, setError] = useState('');
  const nameRef = useRef(null);

  useEffect(() => {
    setUserName(coachee?.user_name || '');
    setError('');
    nameRef.current?.focus();
    nameRef.current?.select();
  }, [coachee]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = userName.trim();

    if (!trimmed) {
      setError('Please enter a name.');
      return;
    }

    try {
      await onSave({ coacheeId: coachee.coachee_id, userName: trimmed });
    } catch (err) {
      setError(err.message || 'Failed to update coachee.');
    }
  };

  if (!coachee) return null;

  return (
    <div className="publish-modal-overlay" onClick={saving ? undefined : onClose}>
      <div className="publish-modal create-coachee-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Edit coachee</h2>
        <p>Update the display name for {coachee.email}.</p>

        <form onSubmit={handleSubmit}>
          <label className="save-page-modal-label" htmlFor="edit-coachee-name">
            Full name
          </label>
          <input
            id="edit-coachee-name"
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
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
