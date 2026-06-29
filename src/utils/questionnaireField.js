export function getQuestionnaireFieldKey(sectionId, fieldIndex, fieldId) {
  return `${sectionId}::${fieldIndex}::${fieldId}`;
}

export function getQuestionnaireFieldInputId(elementId, sectionId, fieldIndex) {
  return `${elementId}-${sectionId}-${fieldIndex}`;
}

export function getQuestionnaireFieldAnswer(answers, fieldKey, fieldId) {
  if (answers[fieldKey] !== undefined) return answers[fieldKey];
  return answers[fieldId];
}
