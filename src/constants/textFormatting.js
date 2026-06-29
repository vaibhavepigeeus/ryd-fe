export const FONT_FAMILIES = {
  serif: "Georgia, 'Times New Roman', serif",
  sans: "'Segoe UI', system-ui, sans-serif",
};

/** Web-safe and common system fonts (Word-style list). */
export const FONT_OPTIONS = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Arial Black', value: 'Arial Black' },
  { label: 'Book Antiqua', value: 'Book Antiqua' },
  { label: 'Calibri', value: 'Calibri' },
  { label: 'Cambria', value: 'Cambria' },
  { label: 'Candara', value: 'Candara' },
  { label: 'Century Gothic', value: 'Century Gothic' },
  { label: 'Comic Sans MS', value: 'Comic Sans MS' },
  { label: 'Consolas', value: 'Consolas' },
  { label: 'Constantia', value: 'Constantia' },
  { label: 'Corbel', value: 'Corbel' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Franklin Gothic Medium', value: 'Franklin Gothic Medium' },
  { label: 'Garamond', value: 'Garamond' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Impact', value: 'Impact' },
  { label: 'Lucida Console', value: 'Lucida Console' },
  { label: 'Lucida Sans Unicode', value: 'Lucida Sans Unicode' },
  { label: 'Palatino Linotype', value: 'Palatino Linotype' },
  { label: 'Segoe UI', value: 'Segoe UI' },
  { label: 'Tahoma', value: 'Tahoma' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS' },
  { label: 'Verdana', value: 'Verdana' },
];

export const FONT_SIZE_OPTIONS = [
  { label: '8', value: '8' },
  { label: '9', value: '9' },
  { label: '10', value: '10' },
  { label: '11', value: '11' },
  { label: '12', value: '12' },
  { label: '14', value: '14' },
  { label: '16', value: '16' },
  { label: '18', value: '18' },
  { label: '20', value: '20' },
  { label: '22', value: '22' },
  { label: '24', value: '24' },
  { label: '26', value: '26' },
  { label: '28', value: '28' },
  { label: '36', value: '36' },
  { label: '48', value: '48' },
  { label: '72', value: '72' },
];

export const HIGHLIGHT_COLORS = [
  '#ffff00',
  '#00ff00',
  '#00ffff',
  '#ff00ff',
  '#ff0000',
  '#0000ff',
  '#ffffff',
  'transparent',
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

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function contentToHtml(content = '', formatting = DEFAULT_TEXT_FORMATTING) {
  if (!content) return '';
  if (/<[a-z][\s\S]*>/i.test(content)) return content;

  const style = buildTextStyle(formatting);
  const inlineStyle = [
    style.fontWeight !== 'normal' ? `font-weight:${style.fontWeight}` : '',
    style.fontStyle !== 'normal' ? `font-style:${style.fontStyle}` : '',
    style.textDecoration !== 'none' ? `text-decoration:${style.textDecoration}` : '',
    style.color ? `color:${style.color}` : '',
    style.fontSize ? `font-size:${style.fontSize}` : '',
    style.fontFamily ? `font-family:${style.fontFamily}` : '',
  ]
    .filter(Boolean)
    .join(';');

  return `<span style="${inlineStyle}">${escapeHtml(content)}</span>`;
}

export function snapFontSize(size) {
  const numeric = Number(size) || 16;
  const sizes = FONT_SIZE_OPTIONS.map((option) => Number(option.value));
  return sizes.reduce((closest, candidate) =>
    Math.abs(candidate - numeric) < Math.abs(closest - numeric) ? candidate : closest
  );
}

export function getNextFontSize(current, direction) {
  const sizes = FONT_SIZE_OPTIONS.map((option) => Number(option.value));
  const snapped = snapFontSize(current);
  const index = sizes.indexOf(snapped);
  if (index === -1) {
    const numeric = Number(current) || 16;
    if (direction > 0) {
      return sizes.find((size) => size > numeric) || sizes[sizes.length - 1];
    }
    return [...sizes].reverse().find((size) => size < numeric) || sizes[0];
  }

  const nextIndex = direction > 0
    ? Math.min(sizes.length - 1, index + 1)
    : Math.max(0, index - 1);
  return sizes[nextIndex];
}

export function getCurrentFontSize(rootElement) {
  const selection = window.getSelection();
  if (!selection?.anchorNode) return 16;

  let node = selection.anchorNode.nodeType === Node.TEXT_NODE
    ? selection.anchorNode.parentElement
    : selection.anchorNode;

  while (node && node !== rootElement) {
    if (node instanceof HTMLElement && node.style.fontSize) {
      return parseInt(node.style.fontSize, 10) || 16;
    }
    node = node.parentElement;
  }

  const computedNode = selection.anchorNode.nodeType === Node.TEXT_NODE
    ? selection.anchorNode.parentElement
    : selection.anchorNode;
  if (computedNode instanceof Element) {
    return parseInt(window.getComputedStyle(computedNode).fontSize, 10) || 16;
  }

  return 16;
}

function selectionInLink(rootElement) {
  const selection = window.getSelection();
  if (!selection?.anchorNode || !rootElement) return false;

  let node = selection.anchorNode;
  while (node && node !== rootElement) {
    if (node.nodeName === 'A') return true;
    node = node.parentNode;
  }
  return false;
}

export function getActiveFormats(rootElement = null) {
  const color = document.queryCommandValue('foreColor');
  const highlight = document.queryCommandValue('hiliteColor') || document.queryCommandValue('backColor');

  let fontFamily = 'Segoe UI';
  let fontSize = '16';
  const selection = window.getSelection();
  if (selection?.anchorNode) {
    if (rootElement) {
      fontSize = String(snapFontSize(getCurrentFontSize(rootElement)));
    }

    const node = selection.anchorNode.nodeType === Node.TEXT_NODE
      ? selection.anchorNode.parentElement
      : selection.anchorNode;
    const computed = node instanceof Element ? window.getComputedStyle(node) : null;
    if (computed?.fontFamily) {
      fontFamily = matchFontOption(computed.fontFamily);
    }
    if (!rootElement && computed?.fontSize) {
      fontSize = String(snapFontSize(parseInt(computed.fontSize, 10) || 16));
    }
  }

  let align = 'left';
  if (document.queryCommandState('justifyFull')) align = 'justify';
  else if (document.queryCommandState('justifyCenter')) align = 'center';
  else if (document.queryCommandState('justifyRight')) align = 'right';

  return {
    bold: document.queryCommandState('bold'),
    italic: document.queryCommandState('italic'),
    underline: document.queryCommandState('underline'),
    strikethrough: document.queryCommandState('strikeThrough'),
    color: rgbToHex(color) || '#1a1a1a',
    highlight: rgbToHex(highlight) || 'transparent',
    fontFamily,
    fontSize,
    align,
    unorderedList: document.queryCommandState('insertUnorderedList'),
    orderedList: document.queryCommandState('insertOrderedList'),
    link: selectionInLink(rootElement),
  };
}

export function matchFontOption(computedFamily = '') {
  const normalized = computedFamily.toLowerCase();
  const match = FONT_OPTIONS.find((font) =>
    normalized.includes(font.value.toLowerCase())
  );
  return match?.value || 'Segoe UI';
}

function rgbToHex(color) {
  if (!color) return null;
  if (color === 'transparent') return 'transparent';
  if (color.startsWith('#')) return color;
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) return null;
  const [, r, g, b] = match;
  return `#${[r, g, b].map((part) => Number(part).toString(16).padStart(2, '0')).join('')}`;
}

export function isTextElement(type) {
  return type === 'title' || type === 'text';
}
