import { useEffect, useMemo, useState } from 'react';
import { useQuestionnaires } from '../../context/QuestionnaireContext';
import { COMPONENT_TYPES, DRAG_TYPES } from '../../constants/builder';
import './QuestionnairePanel.css';

export default function QuestionnairePanel() {
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
  const [searchQuery, setSearchQuery] = useState('');

  const selectedForm = questionnaires.find((q) => q.id === selectedFormId);

  useEffect(() => {
    setSearchQuery('');
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

  const filteredQuestions = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return questions;

    return questions.filter(
      (question) =>
        question.label.toLowerCase().includes(term) ||
        question.questionId.toLowerCase().includes(term) ||
        question.type.toLowerCase().includes(term)
    );
  }, [questions, searchQuery]);

  const handleQuestionDragStart = (e, question) => {
    e.dataTransfer.setData(DRAG_TYPES.COMPONENT, COMPONENT_TYPES.FORM_QUESTION);
    e.dataTransfer.setData(DRAG_TYPES.FORM_QUESTION, JSON.stringify(question));
    e.dataTransfer.effectAllowed = 'copy';
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

          {selectedForm?.title && (
            <p className="questionnaire-form-title">{selectedForm.title}</p>
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

              <div className="questionnaire-search-wrap">
                <input
                  type="search"
                  className="questionnaire-search"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search questions"
                />
                {searchQuery.trim() && (
                  <p className="questionnaire-search-count">
                    {filteredQuestions.length} of {questions.length} questions
                  </p>
                )}
              </div>

              <div
                className={`questionnaire-question-list-wrap${questionsRefreshing ? ' questionnaire-question-list-wrap--refreshing' : ''}`}
              >
                {filteredQuestions.length === 0 ? (
                  <p className="questionnaire-hint">No questions match your search.</p>
                ) : (
                  <ul className="questionnaire-question-list">
                    {filteredQuestions.map((question) => (
                      <li
                        key={question.id}
                        className={`questionnaire-question-item${
                          lastSavedQuestionId === question.id
                            ? ' questionnaire-question-item--saved'
                            : ''
                        }`}
                      >
                        <div
                          className="questionnaire-question-drag"
                          draggable
                          onDragStart={(e) => handleQuestionDragStart(e, question)}
                          title={question.label}
                        >
                          <span className="questionnaire-question-grip" aria-hidden="true">
                            ⠿
                          </span>
                          <div className="questionnaire-question-content">
                            <span className="questionnaire-question-label">{question.label}</span>
                            <div className="questionnaire-question-meta">
                              <span className="questionnaire-question-badge">
                                {question.questionId}
                              </span>
                              <span className="questionnaire-question-badge">
                                v{question.version}
                              </span>
                              <span className="questionnaire-question-badge">{question.type}</span>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}

          {!questionsLoading && !questionsError && selectedFormId && questions.length === 0 && (
            <p className="questionnaire-hint">No questions found for this form.</p>
          )}

          {!selectedFormId && (
            <p className="questionnaire-hint">
              Choose a form to load questions from form_questions, then drag them onto the page
            </p>
          )}
        </>
      )}
    </div>
  );
}
