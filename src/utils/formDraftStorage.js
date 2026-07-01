const DRAFT_PREFIX = 'ryd-form-draft';

function getDraftKey(userId, pageId) {
  return `${DRAFT_PREFIX}:${userId}:${pageId}`;
}

function isNonEmptyValue(value) {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.values(value).some(isNonEmptyValue);
  return true;
}

export function hasFormDraftContent(answers) {
  if (!answers || typeof answers !== 'object') return false;
  return Object.values(answers).some((elementAnswers) => {
    if (!elementAnswers || typeof elementAnswers !== 'object') return false;
    return Object.values(elementAnswers).some(isNonEmptyValue);
  });
}

export function loadFormDraft(userId, pageId) {
  if (!userId || !pageId) return null;

  try {
    const raw = localStorage.getItem(getDraftKey(userId, pageId));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.answers || !hasFormDraftContent(parsed.answers)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function saveFormDraft(userId, pageId, answers) {
  if (!userId || !pageId) return;

  if (!hasFormDraftContent(answers)) {
    clearFormDraft(userId, pageId);
    return;
  }

  try {
    localStorage.setItem(
      getDraftKey(userId, pageId),
      JSON.stringify({
        answers,
        savedAt: new Date().toISOString(),
      }),
    );
  } catch {
    // Ignore quota or privacy mode errors.
  }
}

export function clearFormDraft(userId, pageId) {
  if (!userId || !pageId) return;

  try {
    localStorage.removeItem(getDraftKey(userId, pageId));
  } catch {
    // Ignore storage errors.
  }
}

export function hasStoredFormDraft(userId, pageId) {
  return Boolean(loadFormDraft(userId, pageId));
}
