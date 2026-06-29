import { useBuilder } from '../../context/BuilderContext';
import ElementRenderer from '../elements/ElementRenderer';
import './CanvasElement.css';

export default function CanvasElement({ element, index, isSelected }) {
  const { dispatch } = useBuilder();

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
      <ElementRenderer element={element} isSelected={isSelected} />
    </div>
  );
}
