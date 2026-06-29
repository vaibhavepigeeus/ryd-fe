import { useEffect, useMemo, useState } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { useQuestionnaires } from '../../context/QuestionnaireContext';
import { COMPONENT_TYPES, DRAG_TYPES } from '../../constants/builder';
import './QuestionnairePanel.css';

export default function QuestionnairePanel() {
  const { dispatch } = useBuilder();
  const {
    questionnaires,
    loading,
    error,
    getFormQuestions,
    questionsRevision,
    questionsRefreshing,
    lastSavedQuestionId,
  } = useQuestionnaires();
  const [selectedFormId, setSelectedFormId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState(null);
  const [checkedIds, setCheckedIds] = useState(new Set());

  const selectedForm = questionnaires.find((q) => q.id === selectedFormId);

  useEffect(() => {
    setCheckedIds(new Set());
  }, [selectedFormId]);

  useEffect(() => {
    if (!selectedFormId) {
      setQuestions([]);
      return undefined;
    }

    let cancelled = false;

    async function loadQuestions() {
      try {
        setQuestionsLoading(true);
        setQuestionsError(null);
        const list = await getFormQuestions(selectedFormId);
        if (!cancelled) {
          setQuestions(list);
        }
      } catch (err) {
        if (!cancelled) {
          setQuestionsError(err.message || 'Failed to load questions');
          setQuestions([]);
        }
      } finally {
        if (!cancelled) {
          setQuestionsLoading(false);
        }
      }
    }

    loadQuestions();
    return () => {
      cancelled = true;
    };
  }, [selectedFormId, getFormQuestions, questionsRevision]);

  const checkedQuestions = useMemo(
    () => questions.filter((question) => checkedIds.has(question.id)),
    [questions, checkedIds]
  );

  const toggleQuestion = (questionId) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (checkedIds.size === questions.length) {
      setCheckedIds(new Set());
      return;
    }
    setCheckedIds(new Set(questions.map((question) => question.id)));
  };

  const handleQuestionDragStart = (e, question) => {
    e.dataTransfer.setData(DRAG_TYPES.COMPONENT, COMPONENT_TYPES.FORM_QUESTION);
    e.dataTransfer.setData(DRAG_TYPES.FORM_QUESTION, JSON.stringify(question));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleAddSelected = () => {
    if (checkedQuestions.length === 0) return;
    dispatch({
      type: 'ADD_ELEMENTS',
      payload: { questions: checkedQuestions },
    });
    setCheckedIds(new Set());
  };

  return (
    <div className="questionnaire-panel">
      <h3 className="panel-section-label">QUESTIONNAIRES</h3>

      {loading && <p className="questionnaire-status">Loading forms...</p>}
      {error && <p className="questionnaire-status questionnaire-status--error">{error}</p>}

      {!loading && !error && (
        <>
          <select
            className="questionnaire-select"
            value={selectedFormId}
            onChange={(e) => setSelectedFormId(e.target.value)}
          >
            <option value="">Select a form</option>
            {questionnaires.map((q) => (
              <option key={q.id} value={q.id}>
                {q.subtitle || q.title}
              </option>
            ))}
          </select>

          {selectedForm && (
            <div className="questionnaire-form-summary">
              <span className="questionnaire-form-summary-title">{selectedForm.title}</span>
              <span className="questionnaire-form-summary-subtitle">{selectedForm.subtitle}</span>
            </div>
          )}

          {questionsLoading && !questions.length && (
            <p className="questionnaire-status">Loading questions...</p>
          )}
          {questionsError && (
            <p className="questionnaire-status questionnaire-status--error">{questionsError}</p>
          )}

          {!questionsError && selectedFormId && questions.length > 0 && (
            <>
              {questionsRefreshing && (
                <p className="questionnaire-status questionnaire-status--refreshing">
                  <span className="questionnaire-spinner" aria-hidden="true" />
                  Refreshing questions...
                </p>
              )}

              <div
                className={`questionnaire-question-list-wrap${questionsRefreshing ? ' questionnaire-question-list-wrap--refreshing' : ''}`}
              >
              <div className="questionnaire-actions">
                <button type="button" className="questionnaire-action-btn" onClick={toggleAll}>
                  {checkedIds.size === questions.length ? 'Deselect all' : 'Select all'}
                </button>
                <button
                  type="button"
                  className="questionnaire-action-btn questionnaire-action-btn--primary"
                  onClick={handleAddSelected}
                  disabled={checkedQuestions.length === 0}
                >
                  Add selected ({checkedQuestions.length})
                </button>
              </div>

              <ul className="questionnaire-question-list">
                {questions.map((question) => (
                  <li
                    key={question.id}
                    className={`questionnaire-question-item${
                      lastSavedQuestionId === question.id
                        ? ' questionnaire-question-item--saved'
                        : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="questionnaire-question-check"
                      checked={checkedIds.has(question.id)}
                      onChange={() => toggleQuestion(question.id)}
                    />
                    <div
                      className="questionnaire-question-drag"
                      draggable
                      onDragStart={(e) => handleQuestionDragStart(e, question)}
                      title="Drag onto the page"
                    >
                      <span className="questionnaire-question-label">{question.label}</span>
                      <span className="questionnaire-question-meta">
                        {question.questionId} · v{question.version} · {question.type}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              </div>
            </>
          )}

          {!questionsLoading && !questionsError && selectedFormId && questions.length === 0 && (
            <p className="questionnaire-hint">No questions found for this form.</p>
          )}

          {!selectedFormId && (
            <p className="questionnaire-hint">
              Choose a form to load questions from form_questions, then select or drag them onto the page
            </p>
          )}
        </>
      )}
    </div>
  );
}
