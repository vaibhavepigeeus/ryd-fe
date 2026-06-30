import { useBuilder } from '../../context/BuilderContext';
import { COMPONENT_TYPES } from '../../constants/builder';
import {
  getQuestionTypeLabel,
  hasCheckboxLabel,
  hasMultiOptions,
  MAX_QUESTION_OPTIONS,
  MIN_QUESTION_OPTIONS,
} from '../../constants/questionTypes';
import './QuestionOptionsPanel.css';

function pruneAnswersForOptions(fieldType, currentAnswer, nextOptions) {
  if (fieldType === 'radio' || fieldType === 'dropdown') {
    if (currentAnswer && !nextOptions.includes(currentAnswer)) {
      return '';
    }
    return currentAnswer;
  }

  if (fieldType === 'multi_select' && Array.isArray(currentAnswer)) {
    return currentAnswer.filter((value) => nextOptions.includes(value));
  }

  return currentAnswer;
}

export default function QuestionOptionsPanel() {
  const { state, dispatch } = useBuilder();
  const selected = state.elements.find((el) => el.id === state.selectedId);
  const isFormQuestion = selected?.type === COMPONENT_TYPES.FORM_QUESTION;

  if (!isFormQuestion) {
    return (
      <div className="question-options-panel question-options-panel--empty">
        <h3 className="panel-section-label">ANSWER OPTIONS</h3>
        <p className="question-options-hint">
          Select a question on the page to edit its answer options
        </p>
      </div>
    );
  }

  const { fieldType, options = [], checkboxLabel = 'Yes', questionId, answers = {} } =
    selected.props;
  const showMultiOptions = hasMultiOptions(fieldType);
  const showCheckboxLabel = hasCheckboxLabel(fieldType);

  if (!showMultiOptions && !showCheckboxLabel) {
    return (
      <div className="question-options-panel question-options-panel--empty">
        <h3 className="panel-section-label">ANSWER OPTIONS</h3>
        <p className="question-options-hint">
          {getQuestionTypeLabel(fieldType)} questions do not use answer options
        </p>
      </div>
    );
  }

  const updateProps = (props) => {
    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: { id: selected.id, props },
    });
  };

  const updateOptions = (nextOptions) => {
    if (nextOptions.length < MIN_QUESTION_OPTIONS) return;

    const nonEmpty = nextOptions.map((option) => option.trim()).filter(Boolean);
    const currentAnswer = answers[questionId];
    const prunedAnswer = pruneAnswersForOptions(
      fieldType,
      currentAnswer,
      nonEmpty.length ? nonEmpty : nextOptions
    );

    const props = { options: nextOptions };
    if (prunedAnswer !== currentAnswer) {
      props.answers = { ...answers, [questionId]: prunedAnswer };
    }

    updateProps(props);
  };

  const handleOptionChange = (index, value) => {
    const next = [...options];
    next[index] = value;
    updateOptions(next);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= MIN_QUESTION_OPTIONS) return;
    updateOptions(options.filter((_, i) => i !== index));
  };

  const handleAddOption = () => {
    if (options.length >= MAX_QUESTION_OPTIONS) return;
    updateOptions([...options, `Option ${options.length + 1}`]);
  };

  const handleCheckboxLabelChange = (value) => {
    updateProps({ checkboxLabel: value });
  };

  return (
    <div className="question-options-panel">
      <h3 className="panel-section-label">ANSWER OPTIONS</h3>
      <p className="question-options-type">{getQuestionTypeLabel(fieldType)}</p>

      {showMultiOptions && (
        <>
          <ul className="question-options-list">
            {options.map((option, index) => (
              <li key={`option-${index}`} className="question-options-row">
                <span className="question-options-index">{index + 1}</span>
                <input
                  type="text"
                  className="question-options-input"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  type="button"
                  className="question-options-remove"
                  onClick={() => handleRemoveOption(index)}
                  disabled={options.length <= MIN_QUESTION_OPTIONS}
                  title="Remove option"
                  aria-label={`Remove option ${index + 1}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="question-options-add"
            onClick={handleAddOption}
            disabled={options.length >= MAX_QUESTION_OPTIONS}
          >
            + Add option
          </button>

          <p className="question-options-hint">
            Changes appear on the page immediately. Up to {MAX_QUESTION_OPTIONS} options.
          </p>
        </>
      )}

      {showCheckboxLabel && (
        <>
          <label className="question-options-checkbox-field">
            <span>Checkbox label</span>
            <input
              type="text"
              className="question-options-input question-options-input--full"
              value={checkboxLabel}
              onChange={(e) => handleCheckboxLabelChange(e.target.value)}
              placeholder="Yes"
            />
          </label>
          <p className="question-options-hint">
            This text appears next to the checkbox on the page.
          </p>
        </>
      )}
    </div>
  );
}
