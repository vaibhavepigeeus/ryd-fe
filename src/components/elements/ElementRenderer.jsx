import { COMPONENT_TYPES } from '../../constants/builder';
import TitleElement from './TitleElement';
import TextElement from './TextElement';
import ImageElement from './ImageElement';
import ButtonElement from './ButtonElement';
import ContactFormElement from './ContactFormElement';
import NewsletterFormElement from './NewsletterFormElement';
import QuestionnaireElement from './QuestionnaireElement';
import SectionElement from './SectionElement';
import DividerElement from './DividerElement';
import SpacerElement from './SpacerElement';

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

export default function ElementRenderer({ element, isSelected }) {
  const Component = RENDERERS[element.type];
  if (!Component) return <div>Unknown component: {element.type}</div>;
  return <Component element={element} isSelected={isSelected} />;
}
