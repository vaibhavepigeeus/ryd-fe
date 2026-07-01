import { apiFetch } from './apiClient';

export async function fetchMyCoachees() {
  return apiFetch('/users/my-coachees/');
}

export async function createCoachee({ userName, email }) {
  return apiFetch('/users/my-coachees/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_name: userName,
      email,
    }),
  });
}

export async function updateCoachee(coacheeId, { userName }) {
  return apiFetch('/users/my-coachees/update/', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      coachee_id: coacheeId,
      user_name: userName,
    }),
  });
}

export async function fetchCoaches() {
  return apiFetch('/users/coaches/');
}

export async function fetchMyCoach() {
  return apiFetch('/users/my-coach/');
}

export async function assignCoach(coachId) {
  return apiFetch('/users/my-coach/', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coach_id: coachId }),
  });
}
