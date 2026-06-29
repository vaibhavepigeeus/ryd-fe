import { useState } from 'react';
import { useQuestionnaires } from '../../context/QuestionnaireContext';
import { DRAG_TYPES } from '../../constants/builder';
import './QuestionnairePanel.css';

export default function QuestionnairePanel() {
  const { questionnaires, loading, error } = useQuestionnaires();
  const [selectedId, setSelectedId] = useState('');

  const selected = questionnaires.find((q) => q.id === selectedId);

  const handleDragStart = (e, questionnaireId) => {
    e.dataTransfer.setData(DRAG_TYPES.COMPONENT, 'questionnaire');
    e.dataTransfer.setData(DRAG_TYPES.QUESTIONNAIRE, questionnaireId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="questionnaire-panel">
      <h3 className="panel-section-label">QUESTIONNAIRES</h3>

      {loading && <p className="questionnaire-status">Loading...</p>}
      {error && <p className="questionnaire-status questionnaire-status--error">{error}</p>}

      {!loading && !error && (
        <>
          <select
            className="questionnaire-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">Select a questionnaire</option>
            {questionnaires.map((q) => (
              <option key={q.id} value={q.id}>
                {q.subtitle || q.title}
              </option>
            ))}
          </select>

          {selected ? (
            <div
              className="questionnaire-drag-item"
              draggable
              onDragStart={(e) => handleDragStart(e, selected.id)}
            >
              <span className="questionnaire-drag-icon">📋</span>
              <div className="questionnaire-drag-info">
                <span className="questionnaire-drag-title">{selected.title}</span>
                <span className="questionnaire-drag-subtitle">{selected.subtitle}</span>
              </div>
            </div>
          ) : (
            <p className="questionnaire-hint">
              Choose a questionnaire above, then drag it onto the page
            </p>
          )}
        </>
      )}
    </div>
  );
}
