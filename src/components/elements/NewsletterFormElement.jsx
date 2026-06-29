import './elements.css';

export default function NewsletterFormElement({ element }) {
  const { title, placeholder, submitLabel } = element.props;

  return (
    <div className="el-form el-newsletter">
      <h3 className="el-form-title">{title}</h3>
      <div className="el-newsletter-row">
        <input className="el-form-input" type="email" placeholder={placeholder} readOnly />
        <button type="button" className="el-form-submit">
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
