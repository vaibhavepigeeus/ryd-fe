import { useRef, useCallback } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import {
  isResizableElement,
  getElementSizeStyle,
  getElementSizeClassName,
  MIN_ELEMENT_WIDTH,
  MIN_ELEMENT_HEIGHT,
} from '../../constants/builder';
import ElementRenderer from '../elements/ElementRenderer';
import './CanvasElement.css';

export default function CanvasElement({ element, index, isSelected }) {
  const { dispatch } = useBuilder();
  const contentRef = useRef(null);
  const resizable = isResizableElement(element.type);

  const handleClick = (e) => {
    e.stopPropagation();
    dispatch({ type: 'SELECT_ELEMENT', payload: element.id });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    dispatch({ type: 'REMOVE_ELEMENT', payload: element.id });
  };

  const handleMoveUp = (e) => {
    e.stopPropagation();
    if (index > 0) {
      dispatch({ type: 'MOVE_ELEMENT', payload: { fromIndex: index, toIndex: index - 1 } });
    }
  };

  const handleMoveDown = (e) => {
    e.stopPropagation();
    dispatch({ type: 'MOVE_ELEMENT', payload: { fromIndex: index, toIndex: index + 1 } });
  };

  const startResize = useCallback(
    (e, axis) => {
      e.preventDefault();
      e.stopPropagation();

      const content = contentRef.current;
      if (!content) return;

      const rect = content.getBoundingClientRect();
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = element.props.width ?? rect.width;
      const startHeight = element.props.height ?? rect.height;

      const onMouseMove = (moveEvent) => {
        const updates = {};
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        if (axis === 'e' || axis === 'se') {
          updates.width = Math.round(Math.max(MIN_ELEMENT_WIDTH, startWidth + dx));
        }
        if (axis === 's' || axis === 'se') {
          updates.height = Math.round(Math.max(MIN_ELEMENT_HEIGHT, startHeight + dy));
        }

        dispatch({
          type: 'UPDATE_ELEMENT',
          payload: { id: element.id, props: updates },
        });
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };

      const cursors = { e: 'e-resize', s: 's-resize', se: 'se-resize' };
      document.body.style.userSelect = 'none';
      document.body.style.cursor = cursors[axis];
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [element.id, element.props.width, element.props.height, dispatch]
  );

  const sizeStyle = getElementSizeStyle(element.props);
  const sizeClass = getElementSizeClassName(element.props);

  return (
    <div
      className={`canvas-element ${isSelected ? 'canvas-element--selected' : ''}`}
      onClick={handleClick}
    >
      {isSelected && (
        <div className="element-controls">
          <button type="button" className="control-btn" onClick={handleMoveUp} title="Move up">
            ↑
          </button>
          <span className="control-drag" title="Drag to reorder">⠿</span>
          <button type="button" className="control-btn control-delete" onClick={handleDelete} title="Delete">
            ✕
          </button>
          <button type="button" className="control-btn" onClick={handleMoveDown} title="Move down">
            ↓
          </button>
        </div>
      )}
      <div
        ref={contentRef}
        className={`canvas-element-content ${sizeClass}`}
        style={sizeStyle}
      >
        <ElementRenderer element={element} isSelected={isSelected} />
        {isSelected && resizable && (
          <>
            <div
              className="resize-handle resize-handle--e"
              onMouseDown={(e) => startResize(e, 'e')}
              title="Resize width"
            />
            <div
              className="resize-handle resize-handle--s"
              onMouseDown={(e) => startResize(e, 's')}
              title="Resize height"
            />
            <div
              className="resize-handle resize-handle--se"
              onMouseDown={(e) => startResize(e, 'se')}
              title="Resize width and height"
            />
          </>
        )}
      </div>
    </div>
  );
}
