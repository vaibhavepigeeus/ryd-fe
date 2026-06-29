import { apiFetch } from './apiClient';

export function buildPagePayload(state) {
  return {
    page_name: state.pageTitle || 'Untitled Page',
    layout_data: {
      pageTitle: state.pageTitle,
      previewMode: state.previewMode,
      elements: state.elements,
    },
  };
}

export async function savePage(state, pageId = null) {
  const payload = buildPagePayload(state);

  if (pageId) {
    return apiFetch(`/forms/pages/${pageId}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  return apiFetch('/forms/pages/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function loadPage(pageId) {
  return apiFetch(`/forms/pages/${pageId}/`);
}

export async function publishPage(pageId) {
  return apiFetch(`/forms/pages/${pageId}/publish/`, {
    method: 'POST',
  });
}

export async function fetchPublishedPage(slug) {
  return apiFetch(`/forms/pages/published/${slug}/`);
}

export async function submitPublishedPage(slug, responseData) {
  return apiFetch(`/forms/pages/published/${slug}/submit/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(responseData),
  });
}

export function getPublishedPageUrl(slug) {
  return `${window.location.origin}/p/${slug}`;
}
