import RichTextBlock from './RichTextBlock';
import './elements.css';

export default function TextElement({ element, readOnly = false }) {
  return <RichTextBlock element={element} tag="p" className="el-text" readOnly={readOnly} />;
}
