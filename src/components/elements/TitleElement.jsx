import RichTextBlock from './RichTextBlock';
import './elements.css';

export default function TitleElement({ element, readOnly = false }) {
  return <RichTextBlock element={element} tag="h1" className="el-title" readOnly={readOnly} />;
}
