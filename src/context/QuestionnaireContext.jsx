import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  fetchQuestionnaires,
  fetchQuestionnaireById,
  fetchFormQuestions,
} from '../services/questionnaireApi';

const QuestionnaireContext = createContext(null);

export function QuestionnaireProvider({ children }) {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cacheRef = useRef({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const list = await fetchQuestionnaires();
        if (!cancelled) {
          setQuestionnaires(list);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load questionnaires');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const getQuestionnaire = useCallback(async (id) => {
    if (cacheRef.current[id]) return cacheRef.current[id];

    const data = await fetchQuestionnaireById(id);
    cacheRef.current[id] = data;
    return data;
  }, []);

  const getFormQuestions = useCallback(async (formTypeId) => {
    const cacheKey = `questions-${formTypeId}`;
    if (cacheRef.current[cacheKey]) return cacheRef.current[cacheKey];

    const data = await fetchFormQuestions(formTypeId);
    cacheRef.current[cacheKey] = data;
    return data;
  }, []);

  return (
    <QuestionnaireContext.Provider
      value={{ questionnaires, loading, error, getQuestionnaire, getFormQuestions }}
    >
      {children}
    </QuestionnaireContext.Provider>
  );
}

export function useQuestionnaires() {
  const context = useContext(QuestionnaireContext);
  if (!context) {
    throw new Error('useQuestionnaires must be used within QuestionnaireProvider');
  }
  return context;
}
