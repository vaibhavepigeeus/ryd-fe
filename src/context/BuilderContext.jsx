import { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { createElement, createQuestionnaireElement, createFormQuestionElement } from '../constants/builder';
import { loadPage } from '../services/pageApi';

const LAST_PAGE_ID_KEY = 'ryd:lastPageId';

export { LAST_PAGE_ID_KEY };

const BuilderContext = createContext(null);

export { BuilderContext };

const initialState = {
  elements: [],
  selectedId: null,
  activeTab: 'Build',
  previewMode: 'desktop',
  pageTitle: '',
  pageId: null,
  publishSlug: null,
  saveStatus: 'idle',
  saveMessage: '',
};

function updateElementProps(elements, id, updates) {
  return elements.map((el) =>
    el.id === id ? { ...el, props: { ...el.props, ...updates } } : el
  );
}

function builderReducer(state, action) {
  switch (action.type) {
    case 'ADD_ELEMENT': {
      const newEl = action.payload.question
        ? createFormQuestionElement(action.payload.question)
        : action.payload.questionnaire
          ? createQuestionnaireElement(action.payload.questionnaire)
          : createElement(action.payload.type);
      const index = action.payload.index ?? state.elements.length;
      const elements = [...state.elements];
      elements.splice(index, 0, newEl);
      return { ...state, elements, selectedId: newEl.id };
    }

    case 'ADD_ELEMENTS': {
      const index = action.payload.index ?? state.elements.length;
      const newElements = action.payload.questions.map((question) =>
        createFormQuestionElement(question)
      );
      const elements = [...state.elements];
      elements.splice(index, 0, ...newElements);
      return {
        ...state,
        elements,
        selectedId: newElements[newElements.length - 1]?.id ?? state.selectedId,
      };
    }

    case 'REMOVE_ELEMENT':
      return {
        ...state,
        elements: state.elements.filter((el) => el.id !== action.payload),
        selectedId: state.selectedId === action.payload ? null : state.selectedId,
      };

    case 'SELECT_ELEMENT':
      return { ...state, selectedId: action.payload };

    case 'UPDATE_ELEMENT':
      return {
        ...state,
        elements: updateElementProps(state.elements, action.payload.id, action.payload.props),
      };

    case 'MOVE_ELEMENT': {
      const { fromIndex, toIndex } = action.payload;
      const elements = [...state.elements];
      const [moved] = elements.splice(fromIndex, 1);
      elements.splice(toIndex, 0, moved);
      return { ...state, elements };
    }

    case 'SET_TAB':
      return { ...state, activeTab: action.payload };

    case 'SET_PREVIEW_MODE':
      return { ...state, previewMode: action.payload };

    case 'SET_PAGE_TITLE':
      return { ...state, pageTitle: action.payload };

    case 'SET_PAGE_ID': {
      if (action.payload) {
        localStorage.setItem(LAST_PAGE_ID_KEY, String(action.payload));
      }
      return { ...state, pageId: action.payload };
    }

    case 'SET_PUBLISH_SLUG':
      return { ...state, publishSlug: action.payload };

    case 'SET_SAVE_STATUS':
      return {
        ...state,
        saveStatus: action.payload.status,
        saveMessage: action.payload.message || '',
      };

    case 'LOAD_PAGE': {
      localStorage.setItem(LAST_PAGE_ID_KEY, String(action.payload.id));
      return {
        ...state,
        pageId: action.payload.id,
        pageTitle: action.payload.layout_data?.pageTitle || action.payload.page_name,
        previewMode: action.payload.layout_data?.previewMode || 'desktop',
        elements: action.payload.layout_data?.elements || [],
        publishSlug: action.payload.publish_slug || null,
        selectedId: null,
        saveStatus: 'idle',
        saveMessage: '',
      };
    }

    case 'NEW_PAGE':
      localStorage.removeItem(LAST_PAGE_ID_KEY);
      return {
        ...initialState,
        activeTab: 'Build',
        previewMode: state.previewMode,
      };

    default:
      return state;
  }
}

export function BuilderProvider({ children }) {
  const [state, dispatch] = useReducer(builderReducer, initialState);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreLastPage() {
      const savedId = localStorage.getItem(LAST_PAGE_ID_KEY);
      if (!savedId) {
        setInitializing(false);
        return;
      }

      try {
        const page = await loadPage(savedId);
        if (!cancelled) {
          dispatch({ type: 'LOAD_PAGE', payload: page });
          dispatch({ type: 'SET_TAB', payload: 'Build' });
        }
      } catch {
        localStorage.removeItem(LAST_PAGE_ID_KEY);
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    }

    restoreLastPage();
    return () => {
      cancelled = true;
    };
  }, []);

  if (initializing) {
    return (
      <div className="app-loading">
        <p>Loading your page...</p>
      </div>
    );
  }

  return (
    <BuilderContext.Provider value={{ state, dispatch }}>
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder must be used within BuilderProvider');
  }
  return context;
}
