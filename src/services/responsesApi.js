import { apiFetch } from './apiClient';

export async function fetchPagesWithResponses() {
  const data = await apiFetch('/forms/pages/with-responses/');
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export async function fetchPageSubmissions(pageId) {
  const data = await apiFetch(`/forms/pages/${pageId}/submissions/`);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export async function fetchSubmissionDetail(submissionId) {
  return apiFetch(`/forms/submissions/${submissionId}/`);
}

export async function fetchMySubmissions() {
  const data = await apiFetch('/forms/submissions/mine/');
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}
