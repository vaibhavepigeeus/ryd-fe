import { useBuilder } from '../../context/BuilderContext';
import './elements.css';

export default function ButtonElement({ element }) {
  const { dispatch } = useBuilder();
  const { label, variant } = element.props;

  const handleBlur = (e) => {
    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: { id: element.id, props: { label: e.target.textContent } },
    });
  };

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
