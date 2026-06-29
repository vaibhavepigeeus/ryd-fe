import { useBuilder } from '../../context/BuilderContext';
import { COMPONENT_TYPES } from '../../constants/builder';
import {
  buildTextStyle,
  DEFAULT_TEXT_FORMATTING,
  DEFAULT_TITLE_FORMATTING,
  FONT_SIZE_OPTIONS,
  isTextElement,
  PRESET_COLORS,
} from '../../constants/textFormatting';
import './TextFormatPanel.css';

export default function TextFormatPanel() {
  const { state, dispatch } = useBuilder();
  const selected = state.elements.find((el) => el.id === state.selectedId);
  const isEditableText = selected && isTextElement(selected.type);

  const formatting = isEditableText
    ? selected.props.formatting ||
      (selected.type === COMPONENT_TYPES.TITLE
        ? DEFAULT_TITLE_FORMATTING
        : DEFAULT_TEXT_FORMATTING)
    : null;

  const updateFormatting = (updates) => {
    if (!selected) return;
    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        id: selected.id,
        props: {
          formatting: { ...formatting, ...updates },
        },
      },
    });
  };

  const toggleFormat = (key) => {
    updateFormatting({ [key]: !formatting[key] });
  };

  if (!isEditableText) {
    return (
      <div className="text-format-panel text-format-panel--empty">
        <h3 className="panel-section-label">TEXT STYLE</h3>
        <p className="text-format-hint">Select a Title or Text block to edit formatting</p>
      </div>
    );
  }

  const previewStyle = buildTextStyle(formatting);

  return (
    <div className="text-format-panel">
      <h3 className="panel-section-label">TEXT STYLE</h3>
      <p className="text-format-element-type">
        Editing: {selected.type === COMPONENT_TYPES.TITLE ? 'Title' : 'Text'}
      </p>

      <div className="format-toolbar">
        <button
          type="button"
          className={`format-btn ${formatting.bold ? 'active' : ''}`}
          onClick={() => toggleFormat('bold')}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className={`format-btn ${formatting.italic ? 'active' : ''}`}
          onClick={() => toggleFormat('italic')}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className={`format-btn ${formatting.underline ? 'active' : ''}`}
          onClick={() => toggleFormat('underline')}
          title="Underline"
        >
          <span className="format-underline">U</span>
        </button>

        <span className="format-divider" />

        <button
          type="button"
          className={`format-btn format-btn--align ${formatting.textAlign === 'left' ? 'active' : ''}`}
          onClick={() => updateFormatting({ textAlign: 'left' })}
          title="Align left"
        >
          L
        </button>
        <button
          type="button"
          className={`format-btn format-btn--align ${formatting.textAlign === 'center' ? 'active' : ''}`}
          onClick={() => updateFormatting({ textAlign: 'center' })}
          title="Align center"
        >
          C
        </button>
        <button
          type="button"
          className={`format-btn format-btn--align ${formatting.textAlign === 'right' ? 'active' : ''}`}
          onClick={() => updateFormatting({ textAlign: 'right' })}
          title="Align right"
        >
          R
        </button>
      </div>

      <label className="format-field">
        <span>Font</span>
        <select
          value={formatting.fontFamily}
          onChange={(e) => updateFormatting({ fontFamily: e.target.value })}
        >
          <option value="serif">Serif</option>
          <option value="sans">Sans-serif</option>
        </select>
      </label>

      <label className="format-field">
        <span>Size</span>
        <select
          value={formatting.fontSize}
          onChange={(e) => updateFormatting({ fontSize: e.target.value })}
        >
          {FONT_SIZE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}px
            </option>
          ))}
        </select>
      </label>

      <div className="format-field">
        <span>Color</span>
        <div className="color-options">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`color-swatch ${formatting.color === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => updateFormatting({ color })}
              title={color}
            />
          ))}
          <input
            type="color"
            className="color-picker"
            value={formatting.color}
            onChange={(e) => updateFormatting({ color: e.target.value })}
            title="Custom color"
          />
        </div>
      </div>

      <div className="format-preview">
        <span className="format-preview-label">Preview</span>
        <p style={previewStyle}>{selected.props.content || 'Preview text'}</p>
      </div>
    </div>
  );
}
