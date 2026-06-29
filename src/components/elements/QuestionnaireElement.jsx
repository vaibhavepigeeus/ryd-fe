import { useBuilderOptional } from '../../hooks/useBuilderOptional';
import { FormFieldInput } from './FormFieldInput';
import {
  getQuestionnaireFieldKey,
  getQuestionnaireFieldInputId,
  getQuestionnaireFieldAnswer,
} from '../../utils/questionnaireField';
import './QuestionnaireElement.css';

export default function QuestionnaireElement({
  element,
  answers: externalAnswers,
  onAnswerChange,
}) {
  const builder = useBuilderOptional();
  const { title, subtitle, sections, answers: storedAnswers = {} } = element.props;
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
    <div className="el-questionnaire">
      <h1 className="el-questionnaire-title">{title}</h1>
      {subtitle && <h2 className="el-questionnaire-subtitle">{subtitle}</h2>}

      {sections.map((section) => (
        <div key={section.id} className="el-questionnaire-section">
          <h3 className="el-questionnaire-section-title">{section.title}</h3>
          <p className="el-questionnaire-required-note">* Indicates required field</p>

          <div className="el-questionnaire-fields">
            {section.fields.map((field, fieldIndex) => {
              const fieldKey = getQuestionnaireFieldKey(section.id, fieldIndex, field.id);
              const inputId = getQuestionnaireFieldInputId(element.id, section.id, fieldIndex);

              return (
              <div key={fieldKey} className="el-questionnaire-field">
                <label className="el-questionnaire-label" htmlFor={inputId}>
                  {field.label}
                  {field.required && <span className="el-questionnaire-asterisk"> *</span>}
                </label>
                <FormFieldInput
                  id={inputId}
                  field={field}
                  value={getQuestionnaireFieldAnswer(answers, fieldKey, field.id)}
                  onChange={(value) => handleAnswerChange(fieldKey, value)}
                  className="el-questionnaire-input"
                />
              </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
