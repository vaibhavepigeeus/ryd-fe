import { apiFetch } from './apiClient';

export async function login(email, password) {
  return apiFetch('/users/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export async function register({ userName, email }) {
  return apiFetch('/users/register/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_name: userName,
      email,
    }),
  });
}

export async function logout(userId) {
  return apiFetch('/users/logout/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function checkAuth() {
  return apiFetch('/users/auth_check/', {
    method: 'GET',
  });
}

export async function checkUser(email) {
  return apiFetch('/users/check-user/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
}

export async function verifyOtp(email, otp) {
  const data = await apiFetch('/users/verify-otp/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase(), otp }),
  });

  if (!data.success) {
    throw new Error(data.message || 'Invalid or expired OTP. Please try again.');
  }

  return data;
}

export async function createPassword({ email, password, repassword }) {
  const data = await apiFetch('/users/create-password/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
      repassword,
    }),
  });

  if (data.success === false) {
    throw new Error(data.message || 'Failed to update password.');
  }

  return data;
}

export async function resetPassword({ userId, oldpassword, password, repassword }) {
  const data = await apiFetch('/users/reset-password/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      oldpassword,
      password,
      repassword,
    }),
  });

  if (data.success === false) {
    throw new Error(data.message || 'Failed to update password.');
  }

  return data;
}
