import { useEffect, useState } from 'react';
import {
  fetchPublishedPage,
  submitPublishedPage,
} from '../services/pageApi';
import PublishedElementRenderer from '../components/published/PublishedElementRenderer';
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

  if (submitted) {
    return (
      <div className="published-page published-page--centered">
        <div className="published-success">
          <h1>Thank you!</h1>
          <p>Your response has been submitted successfully.</p>
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
            {elements.map((element) => (
              <div key={element.id} className="published-element">
                <PublishedElementRenderer
                  element={element}
                  answers={answers[element.id] || {}}
                  onAnswerChange={(fieldId, value) => updateAnswer(element.id, fieldId, value)}
                />
              </div>
            ))}
          </div>

          <footer className="published-submit-bar">
            {submitError && <p className="published-submit-error">{submitError}</p>}
            <button type="submit" className="published-submit-btn" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Form'}
            </button>
          </footer>
        </div>
      </form>
    </div>
  );
}
