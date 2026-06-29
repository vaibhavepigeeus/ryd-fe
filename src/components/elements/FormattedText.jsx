import { useBuilder } from '../../context/BuilderContext';
import {
  buildTextStyle,
  DEFAULT_TEXT_FORMATTING,
  DEFAULT_TITLE_FORMATTING,
} from '../../constants/textFormatting';
import './elements.css';

export default function FormattedText({ element, tag: Tag = 'p', className }) {
  const { dispatch } = useBuilder();
  const { content, formatting } = element.props;

  const defaultFormatting =
    Tag === 'h1' ? DEFAULT_TITLE_FORMATTING : DEFAULT_TEXT_FORMATTING;
  const style = buildTextStyle(formatting || defaultFormatting);

  const handleBlur = (e) => {
    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: { id: element.id, props: { content: e.target.textContent } },
    });
  };

  return (
    <Tag
      className={className}
      style={style}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
    >
      {content}
    </Tag>
  );
}
