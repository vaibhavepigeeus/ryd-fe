import { useBuilderOptional } from '../../hooks/useBuilderOptional';
import {
  buildTextStyle,
  DEFAULT_TEXT_FORMATTING,
  DEFAULT_TITLE_FORMATTING,
} from '../../constants/textFormatting';
import './elements.css';

export default function FormattedText({ element, tag: Tag = 'p', className, readOnly = false }) {
  const builder = useBuilderOptional();
  const { content, formatting } = element.props;

  const defaultFormatting =
    Tag === 'h1' ? DEFAULT_TITLE_FORMATTING : DEFAULT_TEXT_FORMATTING;
  const style = buildTextStyle(formatting || defaultFormatting);

  const handleBlur = (e) => {
    if (!builder) return;
    builder.dispatch({
      type: 'UPDATE_ELEMENT',
      payload: { id: element.id, props: { content: e.target.textContent } },
    });
  };

  if (readOnly || !builder) {
    return (
      <Tag className={className} style={style}>
        {content}
      </Tag>
    );
  }

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
