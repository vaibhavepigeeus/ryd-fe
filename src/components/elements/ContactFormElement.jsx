import { useBuilderOptional } from '../../hooks/useBuilderOptional';
import { FormFieldInput, stopFormInteraction } from './FormFieldInput';
import './elements.css';

export default function ContactFormElement({
  element,
  answers: externalAnswers,
  onAnswerChange,
  readOnly = false,
}) {
  const builder = useBuilderOptional();
  const { title, fields, submitLabel, answers: storedAnswers = {} } = element.props;
  const answers = externalAnswers ?? storedAnswers;

  const handleAnswerChange = (fieldId, value) => {
    if (onAnswerChange) {
      onAnswerChange(fieldId, value);
      return;
    }

    if (!builder) return;
    builder.dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        id: element.id,
        props: {
          answers: { ...answers, [fieldId]: value },
        },
      },
    });
  };

  return (
    <div className="el-form">
      <h3 className="el-form-title">{title}</h3>
      <div className="el-form-fields">
        {fields.map((field) => (
          <div key={field.id} className="el-form-field">
            <label className="el-form-label" htmlFor={`${element.id}-${field.id}`}>
              {field.label}
              {field.required && <span className="el-form-required">*</span>}
            </label>
            <FormFieldInput
              id={`${element.id}-${field.id}`}
              field={field}
              value={answers[field.id]}
              onChange={(value) => handleAnswerChange(field.id, value)}
              className="el-form-input"
              readOnly={readOnly}
            />
          </div>
        ))}
      </div>
      {!readOnly && !onAnswerChange && (
        <button
          type="button"
          className="el-form-submit"
          onClick={stopFormInteraction}
          onMouseDown={stopFormInteraction}
        >
          {submitLabel}
        </button>
      )}
    </div>
  );
}
