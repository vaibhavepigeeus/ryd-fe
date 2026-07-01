import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchPublishedPage,
  submitPublishedPage,
} from '../services/pageApi';
import { updateSubmission } from '../services/responsesApi';
import { downloadPublishedSubmissionPdf, buildSubmissionPayload } from '../utils/downloadResponsePdf';
import { clearFormDraft, loadFormDraft, saveFormDraft } from '../utils/formDraftStorage';
import { responseDataToAnswers } from '../utils/responseData';
import ResponsePageContent from '../components/responses/ResponsePageContent';
import FormViewToolbar from '../components/layout/FormViewToolbar';
import PublishedElementRenderer from '../components/published/PublishedElementRenderer';
import '../components/responses/ResponseDetailView.css';
import '../components/layout/Canvas.css';
import './PublishedPage.css';

export default function PublishedPage({
  slug,
  embedded = false,
  onBack = null,
  editSubmission = null,
}) {
  const { user } = useAuth();
  const isEditing = Boolean(editSubmission?.id);
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [successView, setSuccessView] = useState('thankyou');
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPublishedPage(slug);
        if (!cancelled) {
          setPage(data);
          if (isEditing && editSubmission?.response_data) {
            setAnswers(responseDataToAnswers(editSubmission.response_data));
          } else {
            const draft = user?.id ? loadFormDraft(user.id, data.id) : null;
            setAnswers(draft?.answers || {});
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Page not found');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug, user?.id, isEditing, editSubmission]);

  useEffect(() => {
    if (!user?.id || !page?.id || submitted || isEditing) return undefined;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveFormDraft(user.id, page.id, answers);
    }, 400);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [answers, page?.id, submitted, user?.id, isEditing]);

  const buildResponsePayload = () => ({
    pageTitle: page.layout_data?.pageTitle,
    answers,
    elements: page.layout_data?.elements?.map((el) => ({
      id: el.id,
      type: el.type,
      answers: answers[el.id] || {},
    })),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = buildResponsePayload();
      if (isEditing) {
        await updateSubmission(editSubmission.id, payload);
      } else {
        await submitPublishedPage(slug, payload);
      }
      if (user?.id && page?.id) {
        clearFormDraft(user.id, page.id);
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || `Failed to ${isEditing ? 'update' : 'submit'} form`);
    } finally {
      setSubmitting(false);
    }
  };

  const updateAnswer = (elementId, fieldId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [elementId]: {
        ...(prev[elementId] || {}),
        [fieldId]: value,
      },
    }));
  };

  const handleDownload = async () => {
    if (!page) return;

    try {
      setDownloading(true);
      await downloadPublishedSubmissionPdf(page, answers);
    } catch (err) {
      window.alert(err.message || 'Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  const pageClass = embedded ? 'published-page published-page--embedded' : 'published-page';
  const centeredClass = embedded
    ? 'published-page published-page--embedded published-page--centered'
    : 'published-page published-page--centered';

  if (loading) {
    return (
      <div className={centeredClass}>
        <p className="published-status">Loading form...</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className={centeredClass}>
        <p className="published-status published-status--error">
          {error || 'This form is not available.'}
        </p>
        {onBack && (
          <button type="button" className="published-success-view" onClick={onBack}>
            Back to my forms
          </button>
        )}
      </div>
    );
  }

  if (submitted && successView === 'response') {
    const submission = buildSubmissionPayload(
      page,
      answers,
      isEditing ? editSubmission.id : null,
    );
    const pageTitle = page.page_name || page.layout_data?.pageTitle || 'Your response';

    return (
      <div
        className={`published-page published-submitted-view${
          embedded ? ' published-submitted-view--embedded' : ''
        }`}
      >
        <FormViewToolbar
          onBack={() => setSuccessView('thankyou')}
          backLabel="Back"
          title={pageTitle}
        >
          <button
            type="button"
            className="form-view-toolbar-btn"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? 'Preparing PDF...' : 'Download PDF'}
          </button>
        </FormViewToolbar>

        <div className="published-submitted-canvas-wrap">
          <div className="published-submitted-page">
            <ResponsePageContent submission={submission} />
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={centeredClass}>
        <div className="published-success">
          <h1>{isEditing ? 'Response updated!' : 'Thank you!'}</h1>
          <p>
            {isEditing
              ? 'Your response has been updated successfully.'
              : 'Your response has been submitted successfully.'}
          </p>
          <div className="published-success-actions">
            <button
              type="button"
              className="published-success-view"
              onClick={() => setSuccessView('response')}
            >
              View response
            </button>
            <button
              type="button"
              className="published-success-download"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? 'Preparing PDF...' : 'Download PDF'}
            </button>
            {onBack && (
              <button type="button" className="published-success-view" onClick={onBack}>
                Back to my forms
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const { layout_data: layout } = page;
  const elements = layout?.elements || [];

  return (
    <div className={pageClass}>
      <form className="published-form" onSubmit={handleSubmit}>
        <div className="published-page-inner">
          <header className="canvas-header canvas-header--branded">
            <div className="canvas-header-brand">JYOTI GULATI</div>
            <nav className="canvas-header-nav">
              <span>HOME</span>
              <span>ENTREPRENEURSHIP</span>
              <span>LEADERSHIP</span>
              <span>PERSONAL EXCELLENCE</span>
              <span>ARTICLES</span>
              <span>LOG IN</span>
            </nav>
          </header>

          <div className="published-content">
            {submitError && <p className="published-submit-error">{submitError}</p>}
            {elements.map((element) => (
              <div key={element.id} className="published-element">
                <PublishedElementRenderer
                  element={element}
                  answers={answers[element.id] || {}}
                  onAnswerChange={(fieldId, value) => updateAnswer(element.id, fieldId, value)}
                  submitting={submitting}
                />
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
