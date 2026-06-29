import { useEffect, useMemo, useRef, useState } from 'react';
import { useBuilderOptional } from '../../hooks/useBuilderOptional';
import { useQuestionnairesOptional } from '../../hooks/useQuestionnairesOptional';
import { contentToHtml, DEFAULT_TEXT_FORMATTING } from '../../constants/textFormatting';
import { createQuestionVersion } from '../../services/questionnaireApi';
import { FormFieldInput, stopFormInteraction } from './FormFieldInput';
import RichTextBlock from './RichTextBlock';
import './FormQuestionElement.css';

function normalizeHtml(html = '') {
  return html.replace(/\s+/g, ' ').trim();
}

export default function FormQuestionElement({
  element,
  answers: externalAnswers,
  onAnswerChange,
}) {
  const builder = useBuilderOptional();
  const questionnaires = useQuestionnairesOptional();
  const latestLabelRef = useRef({ text: '', html: '' });
  const {
    label,
    savedLabel,
    labelHtml,
    savedLabelHtml,
    labelFormatting = DEFAULT_TEXT_FORMATTING,
    fieldType,
    required,
    questionId,
    sourceQuestionId,
    formTypeId,
    version,
    answers: storedAnswers = {},
  } = element.props;
  const answers = externalAnswers ?? storedAnswers;
  const answerValue = answers[questionId];
  const getBaselineLabel = () => (savedLabel || label).trim();
  const getBaselineHtml = () => {
    if (savedLabelHtml) return savedLabelHtml;
    if (savedLabel) return contentToHtml(savedLabel, labelFormatting);
    return contentToHtml(label, labelFormatting);
  };
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const editorKey = `${sourceQuestionId || 'new'}-${version || '0'}`;

  useEffect(() => {
    latestLabelRef.current = {
      text: label,
      html: labelHtml || contentToHtml(label, labelFormatting),
    };
    setIsDirty(false);
  }, [editorKey]);

  const labelElement = useMemo(
    () => ({
      id: element.id,
      props: {
        label,
        labelHtml,
        labelFormatting,
      },
    }),
    [element.id, label, labelHtml, labelFormatting]
  );

  const updateDirtyState = ({ text, html }) => {
    latestLabelRef.current = { text, html };
    setIsDirty(
      text.trim() !== getBaselineLabel() ||
        normalizeHtml(html) !== normalizeHtml(getBaselineHtml())
    );
  };

  const handleLabelSave = ({ text, html }) => {
    latestLabelRef.current = { text, html };
    updateDirtyState({ text, html });

    if (!builder) return;
    builder.dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        id: element.id,
        props: { label: text, labelHtml: html },
      },
    });
  };

  const handleAnswerChange = (value) => {
    if (onAnswerChange) {
      onAnswerChange(questionId, value);
      return;
    }

    if (!builder) return;
    builder.dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        id: element.id,
        props: {
          answers: { ...answers, [questionId]: value },
        },
      },
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!builder || !sourceQuestionId || saving) return;

    const activeLabel = document.activeElement?.closest?.('.el-form-question-label-text');
    if (activeLabel) {
      activeLabel.blur();
    }

    const { text, html } = latestLabelRef.current;
    const questionText = (html || text || label).trim();
    const plainText = (text || label).trim();

    if (!plainText) {
      setSaveError('Question text cannot be empty');
      return;
    }
    if (
      plainText === getBaselineLabel() &&
      normalizeHtml(html) === normalizeHtml(getBaselineHtml())
    ) {
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const result = await createQuestionVersion(sourceQuestionId, questionText);
      const resolvedFormTypeId = formTypeId || result.formTypeId;
      const resultHtml =
        result.labelHtml || contentToHtml(result.label, labelFormatting);

      if (resolvedFormTypeId && questionnaires?.refreshFormQuestions) {
        await questionnaires.refreshFormQuestions(resolvedFormTypeId, result.id);
      }

      latestLabelRef.current = { text: result.label, html: resultHtml };

      builder.dispatch({
        type: 'UPDATE_ELEMENT',
        payload: {
          id: element.id,
          props: {
            sourceQuestionId: result.id,
            questionId: result.questionId,
            label: result.label,
            savedLabel: result.label,
            labelHtml: resultHtml,
            savedLabelHtml: resultHtml,
            version: result.version,
            fieldType: result.type,
            formTypeId: result.formTypeId,
            answers: {},
          },
        },
      });

      setIsDirty(false);
    } catch (err) {
      setSaveError(err.message || 'Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const field = {
    id: questionId,
    label,
    type: fieldType,
    required,
  };

  const inputId = `${element.id}-${questionId}`;
  const showSave = builder && sourceQuestionId && isDirty && !saving;
  const LabelTag = builder ? 'div' : 'label';
  const labelProps = builder ? {} : { htmlFor: inputId };

  const handleLabelMouseDown = (e) => {
    if (saving) {
      e.preventDefault();
      return;
    }
    stopFormInteraction(e);
  };

  return (
    <div className={`el-form-question${saving ? ' el-form-question--saving' : ''}`}>
      {saving && (
        <div className="el-form-question-loading" role="status" aria-live="polite">
          <span className="el-form-question-spinner" aria-hidden="true" />
          <span className="el-form-question-loading-text">Saving question...</span>
        </div>
      )}

      <div className="el-form-question-label-row">
        <LabelTag className="el-form-question-label" {...labelProps}>
          <RichTextBlock
            element={labelElement}
            tag="span"
            className="el-form-question-label-text"
            readOnly={!builder}
            textField="label"
            htmlField="labelHtml"
            formattingField="labelFormatting"
            onSave={handleLabelSave}
            onChange={updateDirtyState}
            disabled={saving}
            syncKey={editorKey}
            onMouseDown={handleLabelMouseDown}
          />
          {required && <span className="el-form-question-required"> *</span>}
        </LabelTag>
        {showSave && (
          <button
            type="button"
            className="el-form-question-save"
            onClick={handleSave}
            title="Save as new question version"
          >
            ✓
          </button>
        )}
      </div>

      {saveError && <p className="el-form-question-save-error">{saveError}</p>}
      <FormFieldInput
        id={inputId}
        field={field}
        value={answerValue}
        onChange={handleAnswerChange}
        className="el-form-question-input"
      />
    </div>
  );
}
