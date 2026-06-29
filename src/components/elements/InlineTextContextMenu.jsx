import { createPortal } from 'react-dom';
import './InlineTextToolbar.css';

export default function InlineTextContextMenu({ position, onAction, canCut, canCopy }) {
  if (!position) return null;

  const run = (action) => (e) => {
    e.preventDefault();
    onAction(action);
  };

  return createPortal(
    <div
      className="inline-text-context-menu"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <button type="button" disabled={!canCut} onMouseDown={run('cut')}>
        Cut
      </button>
      <button type="button" disabled={!canCopy} onMouseDown={run('copy')}>
        Copy
      </button>
      <button type="button" onMouseDown={run('paste')}>
        Paste
      </button>
      <div className="inline-text-context-menu-divider" />
      <button type="button" onMouseDown={run('bold')}>
        Bold
      </button>
      <button type="button" onMouseDown={run('italic')}>
        Italic
      </button>
      <button type="button" onMouseDown={run('underline')}>
        Underline
      </button>
      <div className="inline-text-context-menu-divider" />
      <button type="button" onMouseDown={run('selectAll')}>
        Select all
      </button>
    </div>,
    document.body
  );
}
