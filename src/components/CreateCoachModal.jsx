import { useEffect, useRef, useState } from 'react';
import './layout/PublishModal.css';
import './CreateCoacheeModal.css';

export default function CreateCoachModal({ saving = false, onSave, onClose }) {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedName = userName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Please enter the coach name.');
      return;
    }
    if (!trimmedEmail) {
      setError('Please enter the coach email.');
      return;
    }

    try {
      await onSave({ userName: trimmedName, email: trimmedEmail });
    } catch (err) {
      setError(err.message || 'Failed to create coach.');
    }
  };

  return (
    <div className="publish-modal-overlay" onClick={saving ? undefined : onClose}>
      <div className="publish-modal create-coachee-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Create coach</h2>
        <p>
          Add a new coach account. A login password will be emailed to them.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="save-page-modal-label" htmlFor="coach-name">
            Full name
          </label>
          <input
            id="coach-name"
            ref={nameRef}
            className="publish-modal-link save-page-modal-input"
            type="text"
            value={userName}
            onChange={(e) => {
              setUserName(e.target.value);
              if (error) setError('');
            }}
            placeholder="Coach name"
            disabled={saving}
            maxLength={100}
            autoComplete="name"
          />

          <label className="save-page-modal-label" htmlFor="coach-email">
            Email
          </label>
          <input
            id="coach-email"
            className="publish-modal-link save-page-modal-input"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            placeholder="coach@example.com"
            disabled={saving}
            autoComplete="email"
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
              {saving ? 'Creating...' : 'Create coach'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
