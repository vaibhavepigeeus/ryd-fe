import { useBuilder } from '../../context/BuilderContext';
import './QuestionnaireElement.css';

export default function QuestionnaireElement({ element }) {
  const { title, subtitle, sections } = element.props;

  return (
    <div className="el-questionnaire">
      <h1 className="el-questionnaire-title">{title}</h1>
      {subtitle && <h2 className="el-questionnaire-subtitle">{subtitle}</h2>}

      {sections.map((section) => (
        <div key={section.id} className="el-questionnaire-section">
          <h3 className="el-questionnaire-section-title">{section.title}</h3>
          <p className="el-questionnaire-required-note">* Indicates required field</p>

          <div className="el-questionnaire-fields">
            {section.fields.map((field) => (
              <div key={field.id} className="el-questionnaire-field">
                <label className="el-questionnaire-label">
                  {field.label}
                  {field.required && <span className="el-questionnaire-asterisk"> *</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    className="el-questionnaire-input"
                    rows={4}
                    readOnly
                    placeholder=""
                  />
                ) : (
                  <input
                    className="el-questionnaire-input"
                    type={field.type || 'text'}
                    readOnly
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
