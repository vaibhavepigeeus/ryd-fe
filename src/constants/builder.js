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

export function createElement(type, overrides = {}) {
  const id = crypto.randomUUID();

  const defaults = {
    [COMPONENT_TYPES.TITLE]: {
      content: 'Click here to edit.',
      level: 'h1',
      formatting: { ...DEFAULT_TITLE_FORMATTING },
    },
    [COMPONENT_TYPES.TEXT]: {
      content: 'Add your text here. Double-click to edit.',
      formatting: { ...DEFAULT_TEXT_FORMATTING },
    },
    [COMPONENT_TYPES.IMAGE]: {
      src: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80',
      alt: 'Placeholder image',
      width: '100%',
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
    },
    [COMPONENT_TYPES.NEWSLETTER_FORM]: {
      title: 'Subscribe',
      placeholder: 'Enter your email',
      submitLabel: 'Subscribe',
    },
    [COMPONENT_TYPES.QUESTIONNAIRE]: {
      questionnaireId: '',
      title: '',
      subtitle: '',
      sections: [],
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
  });
}
