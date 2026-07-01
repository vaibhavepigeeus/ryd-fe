import { useEffect, useState } from 'react';
import { checkUser, verifyOtp } from '../services/authApi';
import './AuthPages.css';

const RESET_EMAIL_KEY = 'reset_email';

export default function VerifyOtpPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

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
    setResendMessage('');
    setSubmitting(true);

    try {
      await verifyOtp(email, otp.trim());
      onNavigate('create-password');
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setResendMessage('');
    setResending(true);

    try {
      await checkUser(email);
      setResendMessage('A new verification code has been sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
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
          <h1>Verify your email</h1>
          <p>Enter the 6-digit code sent to {email}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          {resendMessage && <div className="auth-success">{resendMessage}</div>}

          <div className="auth-field">
            <label htmlFor="otp">Verification code</label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="auth-otp-input"
              required
              autoComplete="one-time-code"
            />
          </div>

          <button type="submit" className="auth-submit" disabled={submitting || otp.length !== 6}>
            {submitting ? 'Verifying...' : 'Verify code'}
          </button>
        </form>

        <p className="auth-footer">
          Didn&apos;t receive a code?{' '}
          <button
            type="button"
            className="auth-link-button"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? 'Sending...' : 'Resend code'}
          </button>
        </p>

        <p className="auth-footer">
          <a
            href="/forgot-password"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('forgot-password');
            }}
          >
            Use a different email
          </a>
        </p>
      </div>
    </div>
  );
}
