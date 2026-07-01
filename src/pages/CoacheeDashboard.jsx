import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ResponseDetailView from '../components/responses/ResponseDetailView';
import PortalHeader from '../components/layout/PortalHeader';
import { fetchMySubmissions, fetchSubmissionDetail } from '../services/responsesApi';
import { fetchPublishedPages } from '../services/pageApi';
import { downloadResponsePdf } from '../utils/downloadResponsePdf';
import PublishedPage from './PublishedPage';
import './CoacheeDashboard.css';

function formatPageDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatSubmittedAt(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getPageTitle(page) {
  return page?.page_name || page?.layout_data?.pageTitle || 'Untitled form';
}

function getSubmissionTitle(submission) {
  return submission.page_name || getPageTitle(submission.page) || 'Untitled form';
}

export default function CoacheeDashboard() {
  const { user } = useAuth();
  const [pages, setPages] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSlug, setActiveSlug] = useState(null);
  const [activeTitle, setActiveTitle] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [openingSubmissionId, setOpeningSubmissionId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [pagesResult, submissionsResult] = await Promise.allSettled([
        fetchPublishedPages(),
        fetchMySubmissions(),
      ]);

      if (pagesResult.status === 'rejected') {
        throw pagesResult.reason;
      }

      const sortedPages = [...pagesResult.value].sort(
        (a, b) =>
          new Date(b.published_at || b.updated_at || 0) -
          new Date(a.published_at || a.updated_at || 0),
      );
      setPages(sortedPages);
      setSubmissions(
        submissionsResult.status === 'fulfilled' ? submissionsResult.value : [],
      );
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
      setPages([]);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const submissionsByPageId = useMemo(() => {
    const map = new Map();
    submissions.forEach((submission) => {
      const pageId = submission.page;
      if (!map.has(pageId)) {
        map.set(pageId, submission);
      }
    });
    return map;
  }, [submissions]);

  const firstName = user?.user_name?.split(' ')[0] || 'there';

  const handleOpenForm = (page) => {
    if (!page.publish_slug) return;
    setActiveTitle(getPageTitle(page));
    setActiveSlug(page.publish_slug);
  };

  const handleBackToHome = () => {
    setActiveSlug(null);
    setActiveTitle('');
    setSelectedSubmission(null);
    loadDashboard();
  };

  const handleOpenSubmission = async (submission) => {
    if (openingSubmissionId) return;

    try {
      setOpeningSubmissionId(submission.id);
      setError(null);
      const detail = await fetchSubmissionDetail(submission.id);
      setSelectedSubmission(detail);
    } catch (err) {
      setError(err.message || 'Failed to load response');
    } finally {
      setOpeningSubmissionId(null);
    }
  };

  const handleDownloadSubmission = async (submission, event) => {
    event?.stopPropagation();
    if (downloadingId) return;

    try {
      setDownloadingId(submission.id);
      setError(null);
      const detail = submission.page?.layout_data
        ? submission
        : await fetchSubmissionDetail(submission.id);
      await downloadResponsePdf(detail);
    } catch (err) {
      setError(err.message || 'Failed to download PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  if (selectedSubmission) {
    return (
      <div className="coachee-dashboard">
        <PortalHeader title="RYD Coachee Portal" />
        <main className="coachee-main coachee-main--form">
          <ResponseDetailView
            submission={selectedSubmission}
            onBack={handleBackToHome}
            backLabel="← Back to my forms"
          />
        </main>
      </div>
    );
  }

  if (activeSlug) {
    return (
      <div className="coachee-dashboard">
        <PortalHeader title="RYD Coachee Portal" />
        <main className="coachee-main coachee-main--form">
          <div className="coachee-form-toolbar">
            <button type="button" className="coachee-form-back" onClick={handleBackToHome}>
              ← Back to my forms
            </button>
            <span className="coachee-form-toolbar-title">{activeTitle}</span>
          </div>
          <div className="coachee-form-view">
            <PublishedPage slug={activeSlug} embedded onBack={handleBackToHome} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="coachee-dashboard">
      <PortalHeader title="RYD Coachee Portal" />

      <main className="coachee-main">
        <section className="coachee-hero">
          <h2>Hello, {firstName}!</h2>
          <p className="coachee-hero-subtitle">
            Complete the assessments shared by your coach below. Select a form to fill it out
            and submit your responses.
          </p>
        </section>

        <section className="coachee-forms-section">
          <div className="coachee-forms-header">
            <h3>Your assessments</h3>
            <span className="coachee-forms-count">
              {pages.length} form{pages.length === 1 ? '' : 's'}
            </span>
          </div>

          {loading && <p className="coachee-forms-message">Loading forms...</p>}
          {error && <p className="coachee-forms-error">{error}</p>}

          {!loading && !error && pages.length === 0 && (
            <div className="coachee-forms-empty">
              <p>
                No assessments are available yet. Your coach will publish forms for you —
                check back here or your email when they are ready.
              </p>
            </div>
          )}

          {!loading && !error && pages.length > 0 && (
            <div className="coachee-forms-grid">
              {pages.map((page) => {
                const submission = submissionsByPageId.get(page.id);
                const isSubmitted = Boolean(submission);

                return (
                  <article key={page.id} className="coachee-form-card coachee-form-card--static">
                    <span className="coachee-form-card-top">
                      <span className="coachee-form-card-title">{getPageTitle(page)}</span>
                      <span
                        className={`coachee-form-card-badge${
                          isSubmitted ? ' coachee-form-card-badge--submitted' : ''
                        }`}
                      >
                        {isSubmitted ? 'Submitted' : 'Ready'}
                      </span>
                    </span>
                    <span className="coachee-form-card-meta">
                      {isSubmitted
                        ? `Submitted ${formatSubmittedAt(submission.submitted_at)}`
                        : `Published ${formatPageDate(page.published_at || page.updated_at)}`}
                    </span>
                    <div className="coachee-form-card-actions">
                      {isSubmitted ? (
                        <>
                          <button
                            type="button"
                            className="coachee-form-card-btn coachee-form-card-btn--primary"
                            onClick={() => handleOpenSubmission(submission)}
                            disabled={Boolean(openingSubmissionId)}
                          >
                            {openingSubmissionId === submission.id
                              ? 'Opening...'
                              : 'View response →'}
                          </button>
                          <button
                            type="button"
                            className="coachee-form-card-btn coachee-form-card-btn--secondary"
                            onClick={() => handleOpenForm(page)}
                            disabled={!page.publish_slug}
                          >
                            Submit again
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="coachee-form-card-btn coachee-form-card-btn--primary"
                          onClick={() => handleOpenForm(page)}
                          disabled={!page.publish_slug}
                        >
                          Open form →
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="coachee-forms-section coachee-responses-section">
          <div className="coachee-forms-header">
            <h3>Your submitted responses</h3>
            <span className="coachee-forms-count">
              {submissions.length} response{submissions.length === 1 ? '' : 's'}
            </span>
          </div>

          {loading && <p className="coachee-forms-message">Loading responses...</p>}

          {!loading && !error && submissions.length === 0 && (
            <div className="coachee-forms-empty">
              <p>You haven&apos;t submitted any responses yet. Complete an assessment above.</p>
            </div>
          )}

          {!loading && submissions.length > 0 && (
            <ul className="coachee-responses-list">
              {submissions.map((submission) => (
                <li key={submission.id} className="coachee-responses-row">
                  <button
                    type="button"
                    className="coachee-responses-item"
                    onClick={() => handleOpenSubmission(submission)}
                    disabled={Boolean(openingSubmissionId) || Boolean(downloadingId)}
                  >
                    <span className="coachee-responses-item-title">
                      {getSubmissionTitle(submission)}
                    </span>
                    <span className="coachee-responses-item-date">
                      {formatSubmittedAt(submission.submitted_at)}
                    </span>
                    <span className="coachee-responses-item-action">
                      {openingSubmissionId === submission.id ? 'Opening...' : 'View response →'}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="coachee-responses-download"
                    onClick={(event) => handleDownloadSubmission(submission, event)}
                    disabled={Boolean(openingSubmissionId) || downloadingId === submission.id}
                    title="Download response as PDF"
                  >
                    {downloadingId === submission.id ? '...' : '↓ PDF'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
