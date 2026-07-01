import { useEffect, useState } from 'react';
import { resetPassword } from '../../services/authApi';
import './ChangePasswordDialog.css';

export default function ChangePasswordDialog({ open, onClose, userId }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMessage('');
    setSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape' && !submitting) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, submitting]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!currentPassword.trim()) {
      setError('Current password is required.');
      return;
    }

    if (!newPassword.trim()) {
      setError('New password is required.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const data = await resetPassword({
        userId,
        oldpassword: currentPassword,
        password: newPassword,
        repassword: confirmPassword,
      });
      setSuccessMessage(data.message || 'Your password has been updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      window.setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <>
      <div
        className="change-password-backdrop"
        aria-hidden="true"
        onClick={submitting ? undefined : handleClose}
      />
      <div className="change-password-dialog" role="dialog" aria-label="Change password">
        <div className="change-password-header">
          <h3>Change password</h3>
          <p>Enter your current password and choose a new one.</p>
        </div>

        <form className="change-password-form" onSubmit={handleSubmit}>
          {error && <div className="change-password-error">{error}</div>}
          {successMessage && <div className="change-password-success">{successMessage}</div>}

          <label className="change-password-field">
            <span>Current password</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              disabled={submitting}
              required
            />
          </label>

          <label className="change-password-field">
            <span>New password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              disabled={submitting}
              required
            />
          </label>

          <label className="change-password-field">
            <span>Confirm new password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              disabled={submitting}
              required
            />
          </label>

          <div className="change-password-actions">
            <button
              type="button"
              className="change-password-cancel"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="change-password-save" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
