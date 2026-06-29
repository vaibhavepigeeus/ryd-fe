import { createPortal } from 'react-dom';
import {
  FONT_OPTIONS,
  FONT_SIZE_OPTIONS,
  HIGHLIGHT_COLORS,
  PRESET_COLORS,
} from '../../constants/textFormatting';
import './InlineTextToolbar.css';

export default function InlineTextToolbar({ position, onCommand, onSaveSelection, activeFormats }) {
  if (!position) return null;

  const run = (command, value) => (e) => {
    e.preventDefault();
    onSaveSelection?.();
    onCommand(command, value);
  };

  const handleToolbarMouseDown = (e) => {
    const tag = e.target.tagName;
    if (tag === 'SELECT' || tag === 'OPTION' || tag === 'INPUT') return;
    e.preventDefault();
  };

  const handleSelectMouseDown = (e) => {
    e.stopPropagation();
    onSaveSelection?.();
  };

  const handleSelectChange = (command) => (e) => {
    onCommand(command, e.target.value);
  };

  return createPortal(
    <div
      className="inline-text-toolbar"
      style={{ top: position.top, left: position.left }}
      onMouseDown={handleToolbarMouseDown}
    >
      <div className="inline-text-toolbar-row">
        <select
          className="inline-text-toolbar-font"
          value={activeFormats.fontFamily || 'Segoe UI'}
          onMouseDown={handleSelectMouseDown}
          onChange={handleSelectChange('fontName')}
          title="Font"
        >
          {FONT_OPTIONS.map((font) => (
            <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
              {font.label}
            </option>
          ))}
        </select>

        <select
          className="inline-text-toolbar-size"
          value={activeFormats.fontSize || '16'}
          onMouseDown={handleSelectMouseDown}
          onChange={handleSelectChange('fontSize')}
          title="Font size"
        >
          {FONT_SIZE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="inline-text-toolbar-btn"
          onMouseDown={run('growFont')}
          title="Increase font size"
        >
          A<sup>+</sup>
        </button>
        <button
          type="button"
          className="inline-text-toolbar-btn"
          onMouseDown={run('shrinkFont')}
          title="Decrease font size"
        >
          A<sub>−</sub>
        </button>
        <button
          type="button"
          className="inline-text-toolbar-btn"
          onMouseDown={run('removeFormat')}
          title="Clear formatting"
        >
          <span className="inline-text-toolbar-clear">A</span>
        </button>

        <span className="inline-text-toolbar-divider" />

        <button
          type="button"
          className={`inline-text-toolbar-btn ${activeFormats.align === 'left' ? 'active' : ''}`}
          onMouseDown={run('justifyLeft')}
          title="Align left"
        >
          ≡
        </button>
        <button
          type="button"
          className={`inline-text-toolbar-btn ${activeFormats.align === 'center' ? 'active' : ''}`}
          onMouseDown={run('justifyCenter')}
          title="Align center"
        >
          ≡
        </button>
        <button
          type="button"
          className={`inline-text-toolbar-btn ${activeFormats.align === 'right' ? 'active' : ''}`}
          onMouseDown={run('justifyRight')}
          title="Align right"
        >
          ≡
        </button>
        <button
          type="button"
          className={`inline-text-toolbar-btn ${activeFormats.align === 'justify' ? 'active' : ''}`}
          onMouseDown={run('justifyFull')}
          title="Justify"
        >
          ≣
        </button>

        <span className="inline-text-toolbar-divider" />

        <button
          type="button"
          className={`inline-text-toolbar-btn ${activeFormats.unorderedList ? 'active' : ''}`}
          onMouseDown={run('insertUnorderedList')}
          title="Bullet list"
        >
          •≡
        </button>
        <button
          type="button"
          className={`inline-text-toolbar-btn ${activeFormats.orderedList ? 'active' : ''}`}
          onMouseDown={run('insertOrderedList')}
          title="Numbered list"
        >
          1.
        </button>
      </div>

      <div className="inline-text-toolbar-row">
        <button
          type="button"
          className={`inline-text-toolbar-btn ${activeFormats.bold ? 'active' : ''}`}
          onMouseDown={run('bold')}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className={`inline-text-toolbar-btn ${activeFormats.italic ? 'active' : ''}`}
          onMouseDown={run('italic')}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className={`inline-text-toolbar-btn ${activeFormats.underline ? 'active' : ''}`}
          onMouseDown={run('underline')}
          title="Underline"
        >
          <span className="inline-text-toolbar-underline">U</span>
        </button>
        <button
          type="button"
          className={`inline-text-toolbar-btn ${activeFormats.strikethrough ? 'active' : ''}`}
          onMouseDown={run('strikeThrough')}
          title="Strikethrough"
        >
          <span className="inline-text-toolbar-strike">ab</span>
        </button>

        <span className="inline-text-toolbar-divider" />

        <button
          type="button"
          className={`inline-text-toolbar-btn ${activeFormats.link ? 'active' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            onSaveSelection?.();
            if (activeFormats.link) {
              onCommand('unlink');
              return;
            }
            const url = window.prompt('Enter link URL', 'https://');
            if (url?.trim()) {
              onCommand('createLink', url.trim());
            }
          }}
          title={activeFormats.link ? 'Remove link' : 'Add link'}
        >
          <span className="inline-text-toolbar-link">🔗</span>
        </button>

      </div>

      <div className="inline-text-toolbar-row inline-text-toolbar-row--colors">
        <div
          className="inline-text-toolbar-color-section inline-text-toolbar-color-section--background"
          title="Text background / highlight color"
        >
          <div className="inline-text-toolbar-color-section-header">
            <span
              className="inline-text-toolbar-color-icon inline-text-toolbar-color-icon--background"
              aria-hidden="true"
            >
              ab
            </span>
            <span className="inline-text-toolbar-color-section-label">Background</span>
          </div>
          <div className="inline-text-toolbar-color-group">
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`inline-text-toolbar-swatch ${
                  activeFormats.highlight === color ? 'active' : ''
                }${color === 'transparent' ? ' inline-text-toolbar-swatch--none' : ''}`}
                style={{
                  backgroundColor: color === 'transparent' ? undefined : color,
                }}
                onMouseDown={run('hiliteColor', color)}
                title={color === 'transparent' ? 'No background' : color}
                aria-label={`Background ${color === 'transparent' ? 'none' : color}`}
              />
            ))}
            <input
              type="color"
              className="inline-text-toolbar-color-picker"
              value={
                activeFormats.highlight && activeFormats.highlight !== 'transparent'
                  ? activeFormats.highlight
                  : '#ffff00'
              }
              onMouseDown={handleSelectMouseDown}
              onChange={(e) => {
                onSaveSelection?.();
                onCommand('hiliteColor', e.target.value);
              }}
              title="Custom background color"
              aria-label="Custom background color"
            />
          </div>
        </div>

        <div
          className="inline-text-toolbar-color-section inline-text-toolbar-color-section--font"
          title="Font / text color"
        >
          <div className="inline-text-toolbar-color-section-header">
            <span
              className="inline-text-toolbar-color-icon inline-text-toolbar-color-icon--font"
              style={{ '--font-color': activeFormats.color || '#e53e3e' }}
              aria-hidden="true"
            >
              A
            </span>
            <span className="inline-text-toolbar-color-section-label">Font color</span>
          </div>
          <div className="inline-text-toolbar-color-group">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`inline-text-toolbar-swatch ${
                  activeFormats.color === color ? 'active' : ''
                }`}
                style={{ backgroundColor: color }}
                onMouseDown={run('foreColor', color)}
                title={color}
                aria-label={`Font color ${color}`}
              />
            ))}
            <input
              type="color"
              className="inline-text-toolbar-color-picker"
              value={activeFormats.color || '#1a1a1a'}
              onMouseDown={handleSelectMouseDown}
              onChange={(e) => {
                onSaveSelection?.();
                onCommand('foreColor', e.target.value);
              }}
              title="Custom font color"
              aria-label="Custom font color"
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
