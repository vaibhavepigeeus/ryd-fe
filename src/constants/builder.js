import {
  DEFAULT_TEXT_FORMATTING,
  DEFAULT_TITLE_FORMATTING,
} from './textFormatting';

export const COMPONENT_TYPES = {
  TITLE: 'title',
  TEXT: 'text',
  IMAGE: 'image',
  BUTTON: 'button',
  CONTACT_FORM: 'contact-form',
  NEWSLETTER_FORM: 'newsletter-form',
  QUESTIONNAIRE: 'questionnaire',
  SECTION: 'section',
  DIVIDER: 'divider',
  SPACER: 'spacer',
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
};

export const RESIZABLE_ELEMENT_TYPES = new Set([
  COMPONENT_TYPES.TITLE,
  COMPONENT_TYPES.TEXT,
  COMPONENT_TYPES.IMAGE,
  COMPONENT_TYPES.CONTACT_FORM,
  COMPONENT_TYPES.NEWSLETTER_FORM,
  COMPONENT_TYPES.QUESTIONNAIRE,
]);

export const MIN_ELEMENT_WIDTH = 100;
export const MIN_ELEMENT_HEIGHT = 60;

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
