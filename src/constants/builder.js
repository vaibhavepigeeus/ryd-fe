import {
  DEFAULT_TEXT_FORMATTING,
  DEFAULT_TITLE_FORMATTING,
  contentToHtml,
} from './textFormatting';

export const COMPONENT_TYPES = {
  TITLE: 'title',
  TEXT: 'text',
  IMAGE: 'image',
  BUTTON: 'button',
  CONTACT_FORM: 'contact-form',
  NEWSLETTER_FORM: 'newsletter-form',
  QUESTIONNAIRE: 'questionnaire',
  FORM_QUESTION: 'form-question',
  SECTION: 'section',
  DIVIDER: 'divider',
  SPACER: 'spacer',
  MAP: 'map',
  TABLE: 'table',
  SOCIAL_ICONS: 'social-icons',
};

export const PALETTE_SECTIONS = [
  {
    id: 'basic',
    label: 'BASIC',
    items: [
      { type: COMPONENT_TYPES.TITLE, label: 'Title', icon: 'T' },
      { type: COMPONENT_TYPES.TEXT, label: 'Text', icon: '≡' },
      { type: COMPONENT_TYPES.IMAGE, label: 'Image', icon: '🖼' },
      { type: COMPONENT_TYPES.BUTTON, label: 'Button', icon: '▭' },
      { type: COMPONENT_TYPES.MAP, label: 'Map', icon: '📍' },
      { type: COMPONENT_TYPES.TABLE, label: 'Table', icon: '⊞' },
      { type: COMPONENT_TYPES.SOCIAL_ICONS, label: 'Social Icons', icon: '◎' },
      { type: COMPONENT_TYPES.CONTACT_FORM, label: 'Contact Form', icon: '☑' },
      { type: COMPONENT_TYPES.NEWSLETTER_FORM, label: 'Newsletter Form', icon: '✉' },
    ],
  },
  {
    id: 'structure',
    label: 'STRUCTURE',
    items: [
      { type: COMPONENT_TYPES.SECTION, label: 'Section', icon: '▢', badge: 'NEW' },
      { type: COMPONENT_TYPES.DIVIDER, label: 'Divider', icon: '—' },
      { type: COMPONENT_TYPES.SPACER, label: 'Spacer', icon: '↕' },
    ],
  },
];

export const NAV_TABS = ['Build', 'Pages', 'Theme', 'Apps', 'Settings'];

export const DRAG_TYPES = {
  COMPONENT: 'component-type',
  QUESTIONNAIRE: 'questionnaire-id',
  FORM_QUESTION: 'form-question-data',
};

export const RESIZABLE_ELEMENT_TYPES = new Set([
  COMPONENT_TYPES.TITLE,
  COMPONENT_TYPES.TEXT,
  COMPONENT_TYPES.IMAGE,
  COMPONENT_TYPES.MAP,
  COMPONENT_TYPES.TABLE,
  COMPONENT_TYPES.CONTACT_FORM,
  COMPONENT_TYPES.NEWSLETTER_FORM,
  COMPONENT_TYPES.QUESTIONNAIRE,
  COMPONENT_TYPES.FORM_QUESTION,
]);

export const MIN_ELEMENT_WIDTH = 100;
export const MIN_ELEMENT_HEIGHT = 60;

export const DEFAULT_TABLE_ROWS = 3;
export const DEFAULT_TABLE_COLS = 4;
export const MIN_TABLE_ROWS = 1;
export const MIN_TABLE_COLS = 1;
export const MAX_TABLE_ROWS = 20;
export const MAX_TABLE_COLS = 12;

export function createTableCells(
  rows = DEFAULT_TABLE_ROWS,
  cols = DEFAULT_TABLE_COLS
) {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ''));
}

export function resizeTableCells(cells, newRows, newCols) {
  const currentRows = cells.length;
  const currentCols = cells[0]?.length ?? 0;
  return Array.from({ length: newRows }, (_, rowIndex) =>
    Array.from({ length: newCols }, (_, colIndex) =>
      rowIndex < currentRows && colIndex < currentCols
        ? (cells[rowIndex][colIndex] ?? '')
        : ''
    )
  );
}

export function clampTableDimension(value, min, max) {
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed)) return min;
  return Math.min(max, Math.max(min, parsed));
}

export function isResizableElement(type) {
  return RESIZABLE_ELEMENT_TYPES.has(type);
}

export function getElementSizeStyle(props = {}) {
  const style = {};
  if (props.width != null) style.width = `${props.width}px`;
  if (props.height != null) style.height = `${props.height}px`;
  return style;
}

export function getElementSizeClassName(props = {}) {
  return [
    'element-sized',
    props.width != null ? 'element-sized--width' : '',
    props.height != null ? 'element-sized--height' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function createElement(type, overrides = {}) {
  const id = crypto.randomUUID();

  const defaults = {
    [COMPONENT_TYPES.TITLE]: {
      content: 'Click here to edit.',
      level: 'h1',
      formatting: { ...DEFAULT_TITLE_FORMATTING },
      width: null,
      height: null,
    },
    [COMPONENT_TYPES.TEXT]: {
      content: 'Add your text here. Double-click to edit.',
      formatting: { ...DEFAULT_TEXT_FORMATTING },
      width: null,
      height: null,
    },
    [COMPONENT_TYPES.IMAGE]: {
      src: '',
      alt: 'Image',
      documentId: null,
      documentName: '',
      width: null,
      height: null,
    },
    [COMPONENT_TYPES.BUTTON]: {
      label: 'Get Started',
      url: '#',
      variant: 'primary',
    },
    [COMPONENT_TYPES.CONTACT_FORM]: {
      title: 'Contact Us',
      fields: [
        { id: 'name', label: 'Name', type: 'text', required: true },
        { id: 'email', label: 'Email', type: 'email', required: true },
        { id: 'message', label: 'Message', type: 'textarea', required: true },
      ],
      submitLabel: 'Send Message',
      answers: {},
      width: 480,
      height: null,
    },
    [COMPONENT_TYPES.NEWSLETTER_FORM]: {
      title: 'Subscribe',
      placeholder: 'Enter your email',
      submitLabel: 'Subscribe',
      answers: {},
      width: 480,
      height: null,
    },
    [COMPONENT_TYPES.QUESTIONNAIRE]: {
      questionnaireId: '',
      title: '',
      subtitle: '',
      sections: [],
      answers: {},
      width: 480,
      height: null,
    },
    [COMPONENT_TYPES.FORM_QUESTION]: {
      sourceQuestionId: '',
      questionId: '',
      label: 'Question',
      savedLabel: '',
      labelHtml: '',
      savedLabelHtml: '',
      labelFormatting: { ...DEFAULT_TEXT_FORMATTING },
      version: '',
      fieldType: 'text',
      required: true,
      formTypeId: '',
      answers: {},
      width: null,
      height: null,
    },
    [COMPONENT_TYPES.SECTION]: {
      children: [],
      padding: '2rem',
      background: '#ffffff',
    },
    [COMPONENT_TYPES.DIVIDER]: {
      style: 'solid',
      color: '#e2e8f0',
    },
    [COMPONENT_TYPES.SPACER]: {
      height: 48,
    },
    [COMPONENT_TYPES.MAP]: {
      address: '1600 Amphitheatre Parkway, Mountain View, CA',
      height: 300,
      width: null,
    },
    [COMPONENT_TYPES.TABLE]: {
      cells: createTableCells(DEFAULT_TABLE_ROWS, DEFAULT_TABLE_COLS),
      width: null,
      height: null,
    },
    [COMPONENT_TYPES.SOCIAL_ICONS]: {
      icons: [
        { platform: 'facebook', url: '' },
        { platform: 'twitter', url: '' },
        { platform: 'instagram', url: '' },
        { platform: 'linkedin', url: '' },
        { platform: 'youtube', url: '' },
      ],
    },
  };

  return {
    id,
    type,
    props: { ...defaults[type], ...overrides },
  };
}

export function createQuestionnaireElement(questionnaire) {
  return createElement(COMPONENT_TYPES.QUESTIONNAIRE, {
    questionnaireId: questionnaire.id,
    title: questionnaire.title,
    subtitle: questionnaire.subtitle,
    sections: questionnaire.sections,
    answers: {},
  });
}

export function createFormQuestionElement(question) {
  const labelFormatting = { ...DEFAULT_TEXT_FORMATTING };
  const labelHtml =
    question.labelHtml || contentToHtml(question.label, labelFormatting);

  return createElement(COMPONENT_TYPES.FORM_QUESTION, {
    sourceQuestionId: question.id,
    questionId: question.questionId,
    label: question.label,
    savedLabel: question.label,
    labelHtml,
    savedLabelHtml: labelHtml,
    labelFormatting,
    version: question.version || '1.0',
    fieldType: question.type,
    required: question.required,
    formTypeId: question.formTypeId,
    answers: {},
  });
}
