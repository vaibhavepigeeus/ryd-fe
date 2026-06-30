export const QUESTION_ANSWER_TYPES = [
  { type: 'text', label: 'Text', icon: 'Ab' },
  { type: 'textarea', label: 'Text Area', icon: '¶' },
  { type: 'number', label: 'Number', icon: '#' },
  { type: 'date', label: 'Date', icon: '📅' },
  { type: 'dropdown', label: 'Dropdown', icon: '▾' },
  { type: 'multi_select', label: 'Multi Select', icon: '☑+' },
  { type: 'checkbox', label: 'Checkbox', icon: '☑' },
  { type: 'radio', label: 'Radio', icon: '◉' },
  { type: 'file', label: 'File', icon: '📎' },
];

export const CHOICE_ANSWER_TYPES = new Set(['dropdown', 'multi_select', 'radio']);

export const MULTI_OPTION_TYPES = CHOICE_ANSWER_TYPES;

export const MAX_QUESTION_OPTIONS = 20;
export const MIN_QUESTION_OPTIONS = 1;

export const DEFAULT_QUESTION_OPTIONS = ['Option 1', 'Option 2', 'Option 3'];

export function getQuestionTypeLabel(type) {
  return QUESTION_ANSWER_TYPES.find((item) => item.type === type)?.label || type;
}

export function hasMultiOptions(type) {
  return MULTI_OPTION_TYPES.has(type);
}

export function hasCheckboxLabel(type) {
  return type === 'checkbox';
}

export function getDefaultOptionsForType(type) {
  return CHOICE_ANSWER_TYPES.has(type) ? [...DEFAULT_QUESTION_OPTIONS] : [];
}
