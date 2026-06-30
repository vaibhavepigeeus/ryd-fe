import { useCallback, useEffect, useState } from 'react';
import {
  fetchPagesWithResponses,
  fetchPageSubmissions,
  fetchSubmissionDetail,
} from '../../services/responsesApi';
import { downloadResponsePdf } from '../../utils/downloadResponsePdf';
import ResponseDetailView from './ResponseDetailView';
import '../layout/PageStartScreen.css';
import './ResponsesScreen.css';

function formatDate(value) {
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
  return page.page_name || 'Untitled form';
}

export default function ResponsesScreen() {
  const [view, setView] = useState('forms');
  const [pages, setPages] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const loadPages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await fetchPagesWithResponses();
      setPages(list);
    } catch (err) {
      setError(err.message || 'Failed to load forms');
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'forms') {
      loadPages();
    }
  }, [view, loadPages]);

  const openPage = async (page) => {
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
  };

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
    return <ResponseDetailView submission={selectedSubmission} onBack={backToSubmissions} />;
  }

  return (
    <main className="page-start-screen responses-screen">
      <div className="page-start-screen-inner">
        {view === 'forms' ? (
          <>
            <header className="page-start-header page-start-header--list">
              <h1>Responses</h1>
              <p>Select a form to view submitted responses.</p>
            </header>

            {loading && !pages.length && (
              <p className="page-start-status">Loading forms...</p>
            )}
            {error && <p className="page-start-status page-start-status--error">{error}</p>}

            {!loading && !error && pages.length === 0 && (
              <div className="page-start-empty">
                <p>No forms found yet. Build and publish a form to collect responses.</p>
              </div>
            )}

            {pages.length > 0 && (
              <div className="page-start-grid">
                {pages.map((page) => (
                  <button
                    key={page.id}
                    type="button"
                    className="page-start-page-card"
                    onClick={() => openPage(page)}
                    disabled={loading}
                  >
                    <span className="page-start-page-card-top">
                      <span className="page-start-page-card-title">{getPageTitle(page)}</span>
                      <span className="responses-count-badge">
                        {page.submission_count || 0}{' '}
                        {(page.submission_count || 0) === 1 ? 'response' : 'responses'}
                      </span>
                    </span>
                    <span className="page-start-page-card-meta">
                      {page.is_published ? 'Published' : 'Draft'} · Updated{' '}
                      {formatDate(page.updated_at)}
                    </span>
                    <span className="page-start-page-card-action">View responses →</span>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <header className="page-start-header page-start-header--list">
              <button type="button" className="page-start-back" onClick={backToForms}>
                ← All forms
              </button>
              <h1>{getPageTitle(selectedPage)}</h1>
              <p>
                {submissions.length}{' '}
                {submissions.length === 1 ? 'response' : 'responses'} submitted
              </p>
            </header>

            {loading && !submissions.length && (
              <p className="page-start-status">Loading responses...</p>
            )}
            {error && <p className="page-start-status page-start-status--error">{error}</p>}

            {!loading && !error && submissions.length === 0 && (
              <div className="page-start-empty">
                <p>No responses for this form yet.</p>
              </div>
            )}

            {submissions.length > 0 && (
              <ul className="responses-list">
                {submissions.map((submission) => (
                  <li key={submission.id} className="responses-list-row">
                    <button
                      type="button"
                      className="responses-list-item"
                      onClick={() => openSubmission(submission)}
                      disabled={loading || Boolean(downloadingId)}
                    >
                      <span className="responses-list-item-title">
                        Response #{submission.id}
                      </span>
                      <span className="responses-list-item-date">
                        {formatDate(submission.submitted_at)}
                      </span>
                      <span className="responses-list-item-action">View response →</span>
                    </button>
                    <button
                      type="button"
                      className="responses-download-btn"
                      onClick={(event) => handleDownload(submission, event)}
                      disabled={loading || downloadingId === submission.id}
                      title="Download response as PDF"
                    >
                      {downloadingId === submission.id ? '...' : '↓ PDF'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </main>
  );
}
