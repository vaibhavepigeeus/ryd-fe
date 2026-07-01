import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function RegisterPage({ onNavigate }) {
  const { register } = useAuth();
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setSubmitting(true);

    try {
      const data = await register({
        userName: userName.trim(),
        email: email.trim(),
      });
      setSuccessMessage(
        data.message || 'Account created. A login password has been sent to your email.',
      );
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successMessage) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="auth-brand-logo">R</div>
            <h1>Check your email</h1>
            <p>Your account has been created</p>
          </div>

          <div className="auth-success">{successMessage}</div>

          <p className="auth-footer" style={{ marginTop: 24 }}>
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('login');
              }}
            >
              Sign in with your emailed password
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-logo">R</div>
          <h1>Create your account</h1>
          <p>We&apos;ll email you a login password</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label htmlFor="userName">Full name</label>
            <input
              id="userName"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your name"
              required
              autoComplete="name"
            />
          </div>

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
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <a href="/login" onClick={(e) => { e.preventDefault(); onNavigate('login'); }}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
