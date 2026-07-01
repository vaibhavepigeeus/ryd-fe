import { apiFetch } from './apiClient';

export async function fetchAdminStats() {
  return apiFetch('/users/admin/dashboard-stats/');
}

export async function fetchAdminCoaches() {
  return apiFetch('/users/admin/coaches/');
}

export async function createAdminCoach({ userName, email }) {
  return apiFetch('/users/admin/coaches/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_name: userName,
      email,
    }),
  });
}

export async function createAdminCoachee({ userName, email, coachId }) {
  return apiFetch('/users/admin/coachees/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_name: userName,
      email,
      coach_id: coachId,
    }),
  });
}

export async function fetchCoachForms(coachId) {
  return apiFetch(`/users/admin/coaches/${coachId}/forms/`);
}

export async function fetchCoachCoachees(coachId) {
  return apiFetch(`/users/admin/coaches/${coachId}/coachees/`);
}
