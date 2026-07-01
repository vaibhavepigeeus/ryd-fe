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
