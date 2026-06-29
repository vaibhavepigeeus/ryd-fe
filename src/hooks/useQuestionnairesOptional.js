import { useContext } from 'react';
import { QuestionnaireContext } from '../context/QuestionnaireContext';

export function useQuestionnairesOptional() {
  return useContext(QuestionnaireContext);
}
