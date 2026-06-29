import { COMPONENT_TYPES } from '../../constants/builder';
import TitleElement from './TitleElement';
import TextElement from './TextElement';
import ImageElement from './ImageElement';
import ButtonElement from './ButtonElement';
import ContactFormElement from './ContactFormElement';
import NewsletterFormElement from './NewsletterFormElement';
import QuestionnaireElement from './QuestionnaireElement';
import FormQuestionElement from './FormQuestionElement';
import SectionElement from './SectionElement';
import DividerElement from './DividerElement';
import SpacerElement from './SpacerElement';
import MapElement from './MapElement';
import TableElement from './TableElement';
import SocialIconsElement from './SocialIconsElement';

const RENDERERS = {
  [COMPONENT_TYPES.TITLE]: TitleElement,
  [COMPONENT_TYPES.TEXT]: TextElement,
  [COMPONENT_TYPES.IMAGE]: ImageElement,
  [COMPONENT_TYPES.BUTTON]: ButtonElement,
  [COMPONENT_TYPES.CONTACT_FORM]: ContactFormElement,
  [COMPONENT_TYPES.NEWSLETTER_FORM]: NewsletterFormElement,
  [COMPONENT_TYPES.QUESTIONNAIRE]: QuestionnaireElement,
  [COMPONENT_TYPES.FORM_QUESTION]: FormQuestionElement,
  [COMPONENT_TYPES.SECTION]: SectionElement,
  [COMPONENT_TYPES.DIVIDER]: DividerElement,
  [COMPONENT_TYPES.SPACER]: SpacerElement,
  [COMPONENT_TYPES.MAP]: MapElement,
  [COMPONENT_TYPES.TABLE]: TableElement,
  [COMPONENT_TYPES.SOCIAL_ICONS]: SocialIconsElement,
};

export default function ElementRenderer({ element, isSelected }) {
  const Component = RENDERERS[element.type];
  if (!Component) return <div>Unknown component: {element.type}</div>;
  return <Component element={element} isSelected={isSelected} />;
}
