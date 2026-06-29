import './elements.css';

export default function ContactFormElement({ element }) {
  const { title, fields, submitLabel } = element.props;

  return (
    <div className="el-form">
      <h3 className="el-form-title">{title}</h3>
      <div className="el-form-fields">
        {fields.map((field) => (
          <div key={field.id} className="el-form-field">
            <label className="el-form-label">
              {field.label}
              {field.required && <span className="el-form-required">*</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea className="el-form-input" rows={4} placeholder={field.label} readOnly />
            ) : (
              <input className="el-form-input" type={field.type} placeholder={field.label} readOnly />
            )}
          </div>
        ))}
      </div>
      <button type="button" className="el-form-submit">
        {submitLabel}
      </button>
    </div>
  );
}
