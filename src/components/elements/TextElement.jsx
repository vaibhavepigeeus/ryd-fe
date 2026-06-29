import FormattedText from './FormattedText';
import './elements.css';

export default function TextElement({ element }) {
  return <FormattedText element={element} tag="p" className="el-text" />;
}
