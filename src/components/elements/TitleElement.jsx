import FormattedText from './FormattedText';
import './elements.css';

export default function TitleElement({ element }) {
  return <FormattedText element={element} tag="h1" className="el-title" />;
}
