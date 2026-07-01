import { useState } from 'react';
import { checkUser } from '../services/authApi';
import './AuthPages.css';

const RESET_EMAIL_KEY = 'reset_email';

export default function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await checkUser(email.trim());
      localStorage.setItem(RESET_EMAIL_KEY, email.trim().toLowerCase());
      onNavigate('verify-otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-logo">R</div>
          <h1>Forgot password?</h1>
          <p>Enter your email and we&apos;ll send you a one-time code</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send verification code'}
          </button>
        </form>

        <p className="auth-footer">
          Remember your password?{' '}
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('login');
            }}
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
