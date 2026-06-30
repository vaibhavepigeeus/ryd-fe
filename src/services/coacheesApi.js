import { apiFetch } from './apiClient';

export async function fetchMyCoachees() {
  return apiFetch('/users/my-coachees/');
}
