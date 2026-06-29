import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  fetchQuestionnaires,
  fetchQuestionnaireById,
  fetchFormQuestions,
} from '../services/questionnaireApi';

const QuestionnaireContext = createContext(null);

export { QuestionnaireContext };

export function QuestionnaireProvider({ children }) {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questionsRevision, setQuestionsRevision] = useState(0);
  const [questionsRefreshing, setQuestionsRefreshing] = useState(false);
  const [lastSavedQuestionId, setLastSavedQuestionId] = useState(null);
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

  useEffect(() => {
    if (!lastSavedQuestionId) return undefined;

    const timer = window.setTimeout(() => setLastSavedQuestionId(null), 3000);
    return () => window.clearTimeout(timer);
  }, [lastSavedQuestionId]);

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

  const refreshFormQuestions = useCallback(async (formTypeId, savedQuestionId = null) => {
    const cacheKey = `questions-${formTypeId}`;
    delete cacheRef.current[cacheKey];

    setQuestionsRefreshing(true);
    try {
      const data = await fetchFormQuestions(formTypeId);
      cacheRef.current[cacheKey] = data;
      setQuestionsRevision((revision) => revision + 1);
      if (savedQuestionId) {
        setLastSavedQuestionId(String(savedQuestionId));
      }
      return data;
    } finally {
      setQuestionsRefreshing(false);
    }
  }, []);

  return (
    <QuestionnaireContext.Provider
      value={{
        questionnaires,
        loading,
        error,
        getQuestionnaire,
        getFormQuestions,
        refreshFormQuestions,
        questionsRevision,
        questionsRefreshing,
        lastSavedQuestionId,
      }}
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
