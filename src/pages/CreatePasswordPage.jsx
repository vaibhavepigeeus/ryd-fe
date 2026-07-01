import { useEffect, useState } from 'react';
import { createPassword } from '../services/authApi';
import './AuthPages.css';

const RESET_EMAIL_KEY = 'reset_email';

export default function CreatePasswordPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repassword, setRepassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem(RESET_EMAIL_KEY);
    if (!storedEmail) {
      onNavigate('forgot-password');
      return;
    }
    setEmail(storedEmail);
  }, [onNavigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== repassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      await createPassword({ email, password, repassword });
      localStorage.removeItem(RESET_EMAIL_KEY);
      localStorage.setItem('password_reset_success', '1');
      onNavigate('login');
    } catch (err) {
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-logo">R</div>
          <h1>Create new password</h1>
          <p>Choose a new password for {email}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label htmlFor="password">New password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="repassword">Confirm password</label>
            <input
              id="repassword"
              type="password"
              value={repassword}
              onChange={(e) => setRepassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? 'Updating...' : 'Update password'}
          </button>
        </form>

        <p className="auth-footer">
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('login');
            }}
          >
            Back to sign in
          </a>
        </p>
      </div>
    </div>
  );
}
