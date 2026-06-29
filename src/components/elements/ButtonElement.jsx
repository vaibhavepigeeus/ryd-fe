import { useBuilderOptional } from '../../hooks/useBuilderOptional';
import './elements.css';

export default function ButtonElement({ element, readOnly = false, submitting = false }) {
  const builder = useBuilderOptional();
  const { label, variant } = element.props;

  const handleBlur = (e) => {
    if (!builder) return;
    builder.dispatch({
      type: 'UPDATE_ELEMENT',
      payload: { id: element.id, props: { label: e.target.textContent } },
    });
  };

  if (readOnly) {
    return (
      <div className="el-button-wrap">
        <span className={`el-button el-button--${variant}`}>{label}</span>
      </div>
    );
  }

  if (!builder) {
    return (
      <div className="el-button-wrap">
        <button
          type="submit"
          className={`el-button el-button--${variant} el-button--published`}
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : label}
        </button>
      </div>
    );
  }

  return (
    <div className="el-button-wrap">
      <span
        className={`el-button el-button--${variant}`}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
      >
        {label}
      </span>
    </div>
  );
}
