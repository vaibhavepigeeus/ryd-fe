export const FONT_FAMILIES = {
  serif: "Georgia, 'Times New Roman', serif",
  sans: "'Segoe UI', system-ui, sans-serif",
};

export const FONT_SIZE_OPTIONS = [
  { label: '12', value: '12' },
  { label: '14', value: '14' },
  { label: '16', value: '16' },
  { label: '18', value: '18' },
  { label: '20', value: '20' },
  { label: '24', value: '24' },
  { label: '28', value: '28' },
  { label: '32', value: '32' },
  { label: '40', value: '40' },
  { label: '48', value: '48' },
];

export const PRESET_COLORS = [
  '#1a1a1a',
  '#444444',
  '#9a3470',
  '#ffffff',
  '#2b6cb0',
  '#e53e3e',
  '#38a169',
  '#d69e2e',
];

export const DEFAULT_TITLE_FORMATTING = {
  bold: false,
  italic: false,
  underline: false,
  color: '#1a1a1a',
  fontSize: '40',
  textAlign: 'left',
  fontFamily: 'serif',
};

export const DEFAULT_TEXT_FORMATTING = {
  bold: false,
  italic: false,
  underline: false,
  color: '#444444',
  fontSize: '16',
  textAlign: 'left',
  fontFamily: 'sans',
};

export function buildTextStyle(formatting = {}) {
  return {
    fontWeight: formatting.bold ? 'bold' : 'normal',
    fontStyle: formatting.italic ? 'italic' : 'normal',
    textDecoration: formatting.underline ? 'underline' : 'none',
    color: formatting.color || '#1a1a1a',
    fontSize: `${formatting.fontSize || '16'}px`,
    textAlign: formatting.textAlign || 'left',
    fontFamily: FONT_FAMILIES[formatting.fontFamily] || FONT_FAMILIES.sans,
  };
}

export function isTextElement(type) {
  return type === 'title' || type === 'text';
}
