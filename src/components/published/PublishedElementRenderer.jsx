import {
  COMPONENT_TYPES,
  getElementSizeStyle,
  getElementSizeClassName,
} from '../../constants/builder';
import TitleElement from '../elements/TitleElement';
import TextElement from '../elements/TextElement';
import ImageElement from '../elements/ImageElement';
import ButtonElement from '../elements/ButtonElement';
import ContactFormElement from '../elements/ContactFormElement';
import NewsletterFormElement from '../elements/NewsletterFormElement';
import QuestionnaireElement from '../elements/QuestionnaireElement';
import SectionElement from '../elements/SectionElement';
import DividerElement from '../elements/DividerElement';
import SpacerElement from '../elements/SpacerElement';

const RENDERERS = {
  [COMPONENT_TYPES.TITLE]: TitleElement,
  [COMPONENT_TYPES.TEXT]: TextElement,
  [COMPONENT_TYPES.IMAGE]: ImageElement,
  [COMPONENT_TYPES.BUTTON]: ButtonElement,
  [COMPONENT_TYPES.CONTACT_FORM]: ContactFormElement,
  [COMPONENT_TYPES.NEWSLETTER_FORM]: NewsletterFormElement,
  [COMPONENT_TYPES.QUESTIONNAIRE]: QuestionnaireElement,
  [COMPONENT_TYPES.SECTION]: SectionElement,
  [COMPONENT_TYPES.DIVIDER]: DividerElement,
  [COMPONENT_TYPES.SPACER]: SpacerElement,
};

function wrapWithSize(element, content) {
  const hasSize = element.props.width != null || element.props.height != null;
  if (!hasSize) return content;

  return (
    <div
      className={getElementSizeClassName(element.props)}
      style={getElementSizeStyle(element.props)}
    >
      {content}
    </div>
  );
}

export default function PublishedElementRenderer({ element, answers, onAnswerChange }) {
  const Component = RENDERERS[element.type];
  if (!Component) return null;

  const isFormType = [
    COMPONENT_TYPES.QUESTIONNAIRE,
    COMPONENT_TYPES.CONTACT_FORM,
    COMPONENT_TYPES.NEWSLETTER_FORM,
  ].includes(element.type);

  if (element.type === COMPONENT_TYPES.TITLE || element.type === COMPONENT_TYPES.TEXT) {
    return wrapWithSize(element, <Component element={element} readOnly />);
  }

  if (isFormType) {
    return wrapWithSize(
      element,
      <Component
        element={element}
        answers={answers}
        onAnswerChange={onAnswerChange}
      />
    );
  }

  return wrapWithSize(element, <Component element={element} />);
}
