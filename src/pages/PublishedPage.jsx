import { useEffect, useState } from 'react';
import {
  fetchPublishedPage,
  submitPublishedPage,
} from '../services/pageApi';
import { downloadPublishedSubmissionPdf, buildSubmissionPayload } from '../utils/downloadResponsePdf';
import ResponsePageContent from '../components/responses/ResponsePageContent';
import PublishedElementRenderer from '../components/published/PublishedElementRenderer';
import '../components/responses/ResponseDetailView.css';
import '../components/layout/Canvas.css';
import './PublishedPage.css';

export default function PublishedPage({ slug }) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [successView, setSuccessView] = useState('thankyou');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPublishedPage(slug);
        if (!cancelled) setPage(data);
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
  }, [slug]);

  const updateAnswer = (elementId, fieldId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [elementId]: {
        ...(prev[elementId] || {}),
        [fieldId]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      await submitPublishedPage(slug, {
        pageTitle: page.layout_data?.pageTitle,
        answers,
        elements: page.layout_data?.elements?.map((el) => ({
          id: el.id,
          type: el.type,
          answers: answers[el.id] || {},
        })),
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
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

  if (loading) {
    return (
      <div className="published-page published-page--centered">
        <p className="published-status">Loading form...</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="published-page published-page--centered">
        <p className="published-status published-status--error">
          {error || 'This form is not available.'}
        </p>
      </div>
    );
  }

  if (submitted && successView === 'response') {
    const submission = buildSubmissionPayload(page, answers);
    const pageTitle = page.page_name || page.layout_data?.pageTitle || 'Your response';

    return (
      <div className="published-page published-submitted-view">
        <div className="published-submitted-toolbar">
          <button
            type="button"
            className="published-submitted-back"
            onClick={() => setSuccessView('thankyou')}
          >
            ← Back
          </button>
          <span className="published-submitted-title">{pageTitle}</span>
          <button
            type="button"
            className="published-submitted-download"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? 'Preparing PDF...' : 'Download PDF'}
          </button>
        </div>

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
      <div className="published-page published-page--centered">
        <div className="published-success">
          <h1>Thank you!</h1>
          <p>Your response has been submitted successfully.</p>
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
          </div>
        </div>
      </div>
    );
  }

  const { layout_data: layout } = page;
  const elements = layout?.elements || [];

  return (
    <div className="published-page">
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
