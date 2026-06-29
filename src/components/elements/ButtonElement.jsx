import { useBuilderOptional } from '../../hooks/useBuilderOptional';
import './elements.css';

export default function ButtonElement({ element, readOnly = false }) {
  const builder = useBuilderOptional();
  const { label, variant } = element.props;

  const handleBlur = (e) => {
    if (!builder) return;
    builder.dispatch({
      type: 'UPDATE_ELEMENT',
      payload: { id: element.id, props: { label: e.target.textContent } },
    });
  };

  if (readOnly || !builder) {
    return (
      <div className="el-button-wrap">
        <span className={`el-button el-button--${variant}`}>{label}</span>
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
