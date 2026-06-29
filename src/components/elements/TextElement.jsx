import FormattedText from './FormattedText';
import './elements.css';

export default function TextElement({ element, readOnly = false }) {
  return <FormattedText element={element} tag="p" className="el-text" readOnly={readOnly} />;
}
