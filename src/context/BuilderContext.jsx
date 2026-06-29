import { createContext, useContext, useReducer } from 'react';
import { createElement, createQuestionnaireElement, COMPONENT_TYPES } from '../constants/builder';
import { DEFAULT_TITLE_FORMATTING } from '../constants/textFormatting';

const BuilderContext = createContext(null);

export { BuilderContext };

const title1 = createElement(COMPONENT_TYPES.TITLE);
const image = createElement(COMPONENT_TYPES.IMAGE);
const title2 = createElement(COMPONENT_TYPES.TITLE);
title2.props.content = 'Relax. Revive. Repeat.';
title2.props.formatting = { ...DEFAULT_TITLE_FORMATTING, color: '#9a3470', fontSize: '32' };

const initialState = {
  elements: [title1, image, title2],
  selectedId: null,
  activeTab: 'Build',
  previewMode: 'desktop',
  pageTitle: 'My Site',
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
      const newEl = action.payload.questionnaire
        ? createQuestionnaireElement(action.payload.questionnaire)
        : createElement(action.payload.type);
      const index = action.payload.index ?? state.elements.length;
      const elements = [...state.elements];
      elements.splice(index, 0, newEl);
      return { ...state, elements, selectedId: newEl.id };
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

    case 'SET_PAGE_ID':
      return { ...state, pageId: action.payload };

    case 'SET_PUBLISH_SLUG':
      return { ...state, publishSlug: action.payload };

    case 'SET_SAVE_STATUS':
      return {
        ...state,
        saveStatus: action.payload.status,
        saveMessage: action.payload.message || '',
      };

    case 'LOAD_PAGE':
      return {
        ...state,
        pageId: action.payload.id,
        pageTitle: action.payload.layout_data?.pageTitle || action.payload.page_name,
        previewMode: action.payload.layout_data?.previewMode || 'desktop',
        elements: action.payload.layout_data?.elements || [],
        selectedId: null,
        saveStatus: 'idle',
        saveMessage: '',
      };

    default:
      return state;
  }
}

export function BuilderProvider({ children }) {
  const [state, dispatch] = useReducer(builderReducer, initialState);

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
