import { useState } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { useQuestionnaires } from '../../context/QuestionnaireContext';
import { DRAG_TYPES, COMPONENT_TYPES } from '../../constants/builder';
import CanvasElement from '../canvas/CanvasElement';
import './Canvas.css';

export default function Canvas() {
  const { state, dispatch } = useBuilder();
  const { getQuestionnaire } = useQuestionnaires();
  const [dropIndex, setDropIndex] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleCanvasClick = (e) => {
    const isEmptyArea =
      e.target.classList.contains('canvas') ||
      e.target.classList.contains('canvas-content') ||
      e.target.classList.contains('canvas-page') ||
      e.target.classList.contains('canvas-empty');

    if (isEmptyArea) {
      dispatch({ type: 'SELECT_ELEMENT', payload: null });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDraggingOver(false);
      setDropIndex(null);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData(DRAG_TYPES.COMPONENT);
    const questionnaireId = e.dataTransfer.getData(DRAG_TYPES.QUESTIONNAIRE);
    const index = dropIndex ?? state.elements.length;

    if (type === COMPONENT_TYPES.QUESTIONNAIRE && questionnaireId) {
      try {
        const questionnaire = await getQuestionnaire(questionnaireId);
        dispatch({
          type: 'ADD_ELEMENT',
          payload: { questionnaire, index },
        });
      } catch {
        // silently fail for now; API errors shown in sidebar
      }
    } else if (type) {
      dispatch({
        type: 'ADD_ELEMENT',
        payload: { type, index },
      });
    }

    setIsDraggingOver(false);
    setDropIndex(null);
  };

  const handleElementDragOver = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    setDropIndex(e.clientY < midY ? index : index + 1);
  };

  const canvasClass = [
    'canvas',
    state.previewMode === 'mobile' ? 'canvas--mobile' : '',
    isDraggingOver ? 'canvas--drag-over' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <main className={canvasClass} onClick={handleCanvasClick}>
      <div
        className="canvas-page"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <header className="canvas-header canvas-header--branded">
          <div className="canvas-header-brand">JYOTI GULATI</div>
          <nav className="canvas-header-nav">
            <span>HOME</span>
            <span>ENTREPRENEURSHIP</span>
            <span>LEADERSHIP</span>
            <span>PERSONAL EXCELLENCE</span>
            <span>ARTICLES</span>
            <span>LOG IN</span>
          </nav>
        </header>

        <div className="canvas-content">
          {state.elements.length === 0 && (
            <div className="canvas-empty">
              Drag components from the left panel to start building
            </div>
          )}

          {state.elements.map((element, index) => (
            <div
              key={element.id}
              className="canvas-drop-zone"
              onDragOver={(e) => handleElementDragOver(e, index)}
            >
              {dropIndex === index && <div className="drop-indicator" />}
              <CanvasElement
                element={element}
                index={index}
                isSelected={state.selectedId === element.id}
              />
            </div>
          ))}

          {dropIndex === state.elements.length && <div className="drop-indicator" />}
        </div>

        <footer className="canvas-footer">
          <span>Remove branding</span>
          <button type="button">CUSTOMIZE YOUR FOOTER</button>
        </footer>
      </div>
    </main>
  );
}
