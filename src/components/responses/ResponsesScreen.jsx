import { useCallback, useEffect, useState } from 'react';
import {
  fetchPagesWithResponses,
  fetchPageSubmissions,
  fetchSubmissionDetail,
} from '../../services/responsesApi';
import { downloadResponsePdf } from '../../utils/downloadResponsePdf';
import ResponseDetailView from './ResponseDetailView';
import '../admin/AdminLayout.css';
import './ResponsesScreen.css';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getSubmitterLabel(submission) {
  const submitter = submission?.submitted_by;
  if (submitter?.user_name) {
    return submitter.user_name;
  }
  return 'Unknown submitter';
}

function getSubmitterEmail(submission) {
  return submission?.submitted_by?.email || '—';
}

function getInitials(name) {
  if (!name || name === 'Unknown submitter') return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getPageTitle(page) {
  return page?.page_name || 'Untitled form';
}

function BackButton({ label, onClick }) {
  return (
    <div className="responses-toolbar">
      <button type="button" className="responses-back-btn" onClick={onClick}>
        <span className="responses-back-icon" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 6l-6 6 6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {label}
      </button>
    </div>
  );
}

export default function ResponsesScreen({ initialPageId = null, onBackToAll = null }) {
  const [view, setView] = useState(initialPageId ? 'loading' : 'forms');
  const [pages, setPages] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(Boolean(initialPageId));
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const loadPages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await fetchPagesWithResponses();
      setPages(list);
      return list;
    } catch (err) {
      setError(err.message || 'Failed to load forms');
      setPages([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const openPage = useCallback(async (page) => {
    try {
      setLoading(true);
      setError(null);
      const list = await fetchPageSubmissions(page.id);
      setSelectedPage(page);
      setSubmissions(list);
      setView('submissions');
    } catch (err) {
      setError(err.message || 'Failed to load responses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'forms') {
      loadPages();
    }
  }, [view, loadPages]);

  useEffect(() => {
    if (!initialPageId) return;

    let active = true;

    (async () => {
      const list = await loadPages();
      if (!active) return;

      const page = list.find((item) => Number(item.id) === Number(initialPageId));
      if (page) {
        await openPage(page);
      } else {
        setError('Form not found');
        setView('forms');
      }
    })();

    return () => {
      active = false;
    };
  }, [initialPageId, loadPages, openPage]);

  const openSubmission = async (submission) => {
    try {
      setLoading(true);
      setError(null);
      const detail = await fetchSubmissionDetail(submission.id);
      setSelectedSubmission(detail);
      setView('detail');
    } catch (err) {
      setError(err.message || 'Failed to load response');
    } finally {
      setLoading(false);
    }
  };

  const backToForms = () => {
    if (onBackToAll) {
      onBackToAll();
      return;
    }

    setView('forms');
    setSelectedPage(null);
    setSubmissions([]);
    setSelectedSubmission(null);
    setError(null);
  };

  const backToSubmissions = () => {
    setView('submissions');
    setSelectedSubmission(null);
    setError(null);
  };

  const handleDownload = async (submission, event) => {
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

  if (view === 'detail' && selectedSubmission) {
    return (
      <ResponseDetailView
        submission={selectedSubmission}
        onBack={backToSubmissions}
        backLabel="Back to responses"
      />
    );
  }

  const backLabel = onBackToAll ? 'Back to dashboard' : 'All forms';
  const totalResponses = pages.reduce((sum, page) => sum + (page.submission_count || 0), 0);

  return (
    <main className="responses-screen">
      <div className="responses-screen-inner admin-dashboard">
        {view === 'forms' ? (
          <>
            <section className="admin-hero">
              <div className="admin-hero-content">
                <span className="admin-hero-eyebrow">Coach console</span>
                <h1>Form responses</h1>
                <p className="admin-hero-subtitle">
                  Select a form below to review who submitted responses and download PDFs.
                </p>
              </div>
              {!loading && pages.length > 0 && (
                <div className="responses-hero-stats">
                  <span className="responses-hero-stat">
                    <strong>{pages.length}</strong> forms
                  </span>
                  <span className="responses-hero-stat">
                    <strong>{totalResponses}</strong> responses
                  </span>
                </div>
              )}
            </section>

            {loading && !pages.length && (
              <p className="admin-loading-dots">Loading forms</p>
            )}
            {error && <p className="admin-alert admin-alert--error">{error}</p>}

            {!loading && !error && pages.length === 0 && (
              <section className="admin-panel">
                <div className="admin-empty">
                  <p>No forms found yet. Build and publish a form to collect responses.</p>
                </div>
              </section>
            )}

            {pages.length > 0 && (
              <>
                <h2 className="admin-section-title">Your forms</h2>
                <div className="responses-forms-grid">
                  {pages.map((page) => (
                    <button
                      key={page.id}
                      type="button"
                      className="responses-form-card"
                      onClick={() => openPage(page)}
                      disabled={loading}
                    >
                      <span className="responses-form-card-top">
                        <span className="responses-form-card-title">{getPageTitle(page)}</span>
                        <span className="responses-count-badge">
                          {page.submission_count || 0}{' '}
                          {(page.submission_count || 0) === 1 ? 'response' : 'responses'}
                        </span>
                      </span>
                      <span className="responses-form-card-meta">
                        {page.is_published ? 'Published' : 'Draft'} · Updated{' '}
                        {formatDate(page.updated_at)}
                      </span>
                      <span className="responses-form-card-action">View responses →</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        ) : view === 'loading' ? (
          <p className="admin-loading-dots">Loading responses</p>
        ) : (
          <>
            <BackButton label={backLabel} onClick={backToForms} />

            <section className="admin-hero">
              <div className="admin-hero-content">
                <span className="admin-hero-eyebrow">Form responses</span>
                <h1>{getPageTitle(selectedPage)}</h1>
                <p className="admin-hero-subtitle">
                  {submissions.length}{' '}
                  {submissions.length === 1 ? 'response' : 'responses'} submitted
                </p>
              </div>
            </section>

            <section className="admin-panel responses-panel">
              <div className="responses-panel-header">
                <div className="responses-panel-header-text">
                  <h2>All responses</h2>
                  <p className="responses-panel-desc">
                    Click a row to open the full response, or download a PDF.
                  </p>
                </div>
                <span className="responses-panel-count">
                  {submissions.length} total
                </span>
              </div>

              {loading && !submissions.length && (
                <p className="admin-loading-dots responses-panel-message">Loading responses</p>
              )}
              {error && <p className="admin-alert admin-alert--error responses-panel-message">{error}</p>}

              {!loading && !error && submissions.length === 0 && (
                <div className="admin-empty responses-panel-message">
                  <p>No responses for this form yet.</p>
                </div>
              )}

              {!loading && !error && submissions.length > 0 && (
                <div className="responses-table-wrap">
                  <table className="responses-table">
                    <thead>
                      <tr>
                        <th className="responses-table-col-submitter">Submitter</th>
                        <th className="responses-table-col-response">Response</th>
                        <th className="responses-table-col-date">Submitted</th>
                        <th className="responses-table-col-actions">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((submission) => {
                        const name = getSubmitterLabel(submission);
                        const isUnknown = !submission?.submitted_by;

                        return (
                          <tr
                            key={submission.id}
                            className="responses-table-row"
                            onClick={() => openSubmission(submission)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                openSubmission(submission);
                              }
                            }}
                            tabIndex={0}
                            role="button"
                            aria-label={`View response from ${name}`}
                          >
                            <td className="responses-table-col-submitter">
                              <div className="responses-submitter-cell">
                                <span
                                  className={`responses-avatar ${
                                    isUnknown ? 'responses-avatar--unknown' : ''
                                  }`}
                                >
                                  {getInitials(name)}
                                </span>
                                <span className="responses-submitter-info">
                                  <span className="responses-submitter-name">{name}</span>
                                  <span className="responses-submitter-email">
                                    {getSubmitterEmail(submission)}
                                  </span>
                                </span>
                              </div>
                            </td>
                            <td className="responses-table-col-response">
                              <span className="responses-response-id">
                                #{submission.id}
                              </span>
                            </td>
                            <td className="responses-table-col-date">
                              {formatDate(submission.submitted_at)}
                            </td>
                            <td className="responses-table-col-actions">
                              <div className="responses-actions-cell">
                                <button
                                  type="button"
                                  className="responses-table-btn responses-table-btn--view"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    openSubmission(submission);
                                  }}
                                  disabled={loading || Boolean(downloadingId)}
                                >
                                  View
                                </button>
                                <button
                                  type="button"
                                  className="responses-table-btn responses-table-btn--pdf"
                                  onClick={(event) => handleDownload(submission, event)}
                                  disabled={loading || downloadingId === submission.id}
                                  title="Download response as PDF"
                                >
                                  {downloadingId === submission.id ? '...' : 'PDF'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
