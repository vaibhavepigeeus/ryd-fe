import { useState } from 'react';
import { COMPONENT_TYPES, DRAG_TYPES } from '../../constants/builder';
import { QUESTION_ANSWER_TYPES } from '../../constants/questionTypes';
import './QuestionTypePanel.css';

export default function QuestionTypePanel() {
  const [open, setOpen] = useState(false);

  const handleDragStart = (e, answerType) => {
    e.dataTransfer.setData(DRAG_TYPES.COMPONENT, COMPONENT_TYPES.FORM_QUESTION);
    e.dataTransfer.setData(DRAG_TYPES.QUESTION_TYPE, answerType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className={`question-type-panel${open ? ' question-type-panel--open' : ''}`}>
      <button
        type="button"
        className="question-type-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className="question-type-toggle-label">Add question</span>
        <span className="question-type-toggle-chevron" aria-hidden="true">
          {open ? '▴' : '▾'}
        </span>
      </button>

      {open && (
        <div className="question-type-dropdown">
          <p className="question-type-hint">Drag a type onto the page</p>
          <ul className="question-type-list">
            {QUESTION_ANSWER_TYPES.map((item) => (
              <li key={item.type}>
                <div
                  className="question-type-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.type)}
                  title={`Drag ${item.label} question onto the page`}
                >
                  <span className="question-type-icon">{item.icon}</span>
                  <span className="question-type-label">{item.label}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
