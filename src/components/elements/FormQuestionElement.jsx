import { useBuilderOptional } from '../../hooks/useBuilderOptional';
import { FormFieldInput, stopFormInteraction } from './FormFieldInput';
import './FormQuestionElement.css';

export default function FormQuestionElement({
  element,
  answers: externalAnswers,
  onAnswerChange,
}) {
  const builder = useBuilderOptional();
  const {
    label,
    fieldType,
    required,
    questionId,
    answers: storedAnswers = {},
  } = element.props;
  const answers = externalAnswers ?? storedAnswers;
  const answerValue = answers[questionId];

  const handleAnswerChange = (value) => {
    if (onAnswerChange) {
      onAnswerChange(questionId, value);
      return;
    }

    if (!builder) return;
    builder.dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        id: element.id,
        props: {
          answers: { ...answers, [questionId]: value },
        },
      },
    });
  };

  const handleLabelBlur = (e) => {
    if (!builder) return;
    builder.dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        id: element.id,
        props: { label: e.target.textContent },
      },
    });
  };

  const field = {
    id: questionId,
    label,
    type: fieldType,
    required,
  };

  const inputId = `${element.id}-${questionId}`;

  return (
    <div className="el-form-question">
      <label className="el-form-question-label" htmlFor={inputId}>
        {builder ? (
          <span
            className="el-form-question-label-text"
            contentEditable
            suppressContentEditableWarning
            onBlur={handleLabelBlur}
            onMouseDown={stopFormInteraction}
            onClick={stopFormInteraction}
          >
            {label}
          </span>
        ) : (
          <span className="el-form-question-label-text">{label}</span>
        )}
        {required && <span className="el-form-question-required"> *</span>}
      </label>
      <FormFieldInput
        id={inputId}
        field={field}
        value={answerValue}
        onChange={handleAnswerChange}
        className="el-form-question-input"
      />
    </div>
  );
}
