import { useEffect, useRef, useState } from 'react';
import './PublishModal.css';

export default function SavePageModal({
  initialName = '',
  isUpdate = false,
  saving = false,
  onSave,
  onClose,
}) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    setName(initialName);
    setError('');
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [initialName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a page name');
      return;
    }
    onSave(trimmed);
  };

  return (
    <div className="publish-modal-overlay" onClick={saving ? undefined : onClose}>
      <div className="publish-modal save-page-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isUpdate ? 'Save page' : 'Name your page'}</h2>
        <p>
          {isUpdate
            ? 'Update the page name and save your latest changes.'
            : 'Give this page a name so you can find it later.'}
        </p>

        <form onSubmit={handleSubmit}>
          <label className="save-page-modal-label" htmlFor="page-name-input">
            Page name
          </label>
          <input
            id="page-name-input"
            ref={inputRef}
            className="publish-modal-link save-page-modal-input"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g. RYD Daily Reflection Form"
            disabled={saving}
            maxLength={120}
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
              {saving ? 'Saving...' : 'Save page'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
