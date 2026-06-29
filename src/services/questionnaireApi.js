import { apiFetch } from './apiClient';

/**
 * Questionnaire API — backed by Django forms service.
 *
 * Backend endpoints:
 *   GET /api/forms/types/           → form list
 *   GET /api/forms/types/:id/full/  → nested questionnaire for builder
 *
 * Set VITE_API_URL in .env when not using the Vite dev proxy (default: /api).
 */

const FREQUENCY_LABELS = {
  1: 'Annually',
  2: 'Quarterly',
  3: 'Monthly',
  4: 'Weekly',
  5: 'Daily',
  6: 'Adhoc',
  99: 'Other',
};

function stripHtml(value) {
  if (!value) return '';
  const doc = new DOMParser().parseFromString(value, 'text/html');
  return doc.body.textContent?.trim() || '';
}

function mapFormTypeToListItem(formType) {
  const frequencyLabel = FREQUENCY_LABELS[formType.frequency] || 'Form';

  return {
    id: String(formType.id),
    formId: formType.form_id,
    title: stripHtml(formType.form_name),
    subtitle: `RYD ${frequencyLabel} Tool`,
  };
}

export async function fetchQuestionnaires() {
  const formTypes = await apiFetch('/forms/types/');

  if (!Array.isArray(formTypes)) {
    throw new Error('Unexpected response from /forms/types/');
  }

  return formTypes.map(mapFormTypeToListItem);
}

export async function fetchQuestionnaireById(id) {
  const questionnaire = await apiFetch(`/forms/types/${id}/full/`);

  return {
    id: String(questionnaire.id),
    formId: questionnaire.formId,
    title: questionnaire.title,
    subtitle: questionnaire.subtitle,
    sections: (questionnaire.sections || []).map((section) => ({
      id: String(section.id),
      title: section.title,
      fields: (section.fields || []).map((field) => ({
        id: field.id,
        label: field.label,
        type: field.type,
        required: Boolean(field.required),
      })),
    })),
  };
}
