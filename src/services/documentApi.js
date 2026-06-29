import { apiUpload } from './apiClient';

/**
 * Upload a file via the Documents API.
 * POST /api/documents/document_upload/
 */
export async function uploadDocument(file, metadata = {}) {
  const today = new Date().toISOString().split('T')[0];
  const formData = new FormData();

  formData.append('document_file', file);
  formData.append('document_name', metadata.name || file.name);
  formData.append('document_date', metadata.date || today);
  formData.append('document_type', metadata.type || 'image');

  if (metadata.details) {
    formData.append('document_details', metadata.details);
  }

  return apiUpload('/documents/document_upload/', formData);
}

/**
 * Normalize document_file URL from API for use in <img src>.
 * Converts absolute backend URLs to /media/... paths for the Vite dev proxy.
 */
export function resolveMediaUrl(url) {
  if (!url) return '';

  if (url.startsWith('/media/')) {
    return url;
  }

  try {
    const { pathname } = new URL(url);
    if (pathname.startsWith('/media/')) {
      return pathname;
    }
  } catch {
    // not a full URL — treat as relative media path
    if (!url.startsWith('http')) {
      return url.startsWith('/') ? url : `/media/${url}`;
    }
  }

  return url;
}
