import { useBuilderOptional } from '../../hooks/useBuilderOptional';
import { stopFormInteraction } from './FormFieldInput';
import './elements.css';

export default function NewsletterFormElement({
  element,
  answers: externalAnswers,
  onAnswerChange,
  readOnly = false,
}) {
  const builder = useBuilderOptional();
  const { title, placeholder, submitLabel, answers: storedAnswers = {} } = element.props;
  const answers = externalAnswers ?? storedAnswers;

  const handleEmailChange = (e) => {
    const value = e.target.value;
    if (onAnswerChange) {
      onAnswerChange('email', value);
      return;
    }

    if (!builder) return;
    builder.dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        id: element.id,
        props: {
          answers: { ...answers, email: value },
        },
      },
    });
  };

  return (
    <div className="el-form el-newsletter">
      <h3 className="el-form-title">{title}</h3>
      <div className="el-newsletter-row">
        <input
          className="el-form-input"
          type="email"
          placeholder={placeholder}
          value={answers.email ?? ''}
          onChange={handleEmailChange}
          onClick={stopFormInteraction}
          onMouseDown={stopFormInteraction}
          onFocus={stopFormInteraction}
          readOnly={readOnly}
          disabled={readOnly}
        />
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
    </div>
  );
}
