import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ResponseDetailView from '../components/responses/ResponseDetailView';
import PortalHeader from '../components/layout/PortalHeader';
import FormViewToolbar from '../components/layout/FormViewToolbar';
import { fetchMySubmissions, fetchSubmissionDetail } from '../services/responsesApi';
import { fetchPublishedPages } from '../services/pageApi';
import { downloadResponsePdf } from '../utils/downloadResponsePdf';
import { loadFormDraft } from '../utils/formDraftStorage';
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

const FORM_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'draft', label: 'Draft' },
  { id: 'pending', label: 'Pending' },
];

const EMPTY_FILTER_MESSAGES = {
  all: 'No assessments to show.',
  submitted: 'No submitted assessments yet.',
  draft: 'No drafts — start a form and your progress will be saved automatically.',
  pending: 'You\'re all caught up — no assessments waiting to start.',
};

function FormCardSkeleton() {
  return (
    <div className="coachee-form-card coachee-form-card--skeleton" aria-hidden="true">
      <div className="coachee-skeleton coachee-skeleton--title" />
      <div className="coachee-skeleton coachee-skeleton--meta" />
      <div className="coachee-skeleton coachee-skeleton--btn" />
    </div>
  );
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
  const [editingSubmissionId, setEditingSubmissionId] = useState(null);
  const [editSubmission, setEditSubmission] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [formFilter, setFormFilter] = useState('all');

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

  const pageTitleCounts = useMemo(() => {
    const counts = new Map();
    pages.forEach((page) => {
      const title = getPageTitle(page);
      counts.set(title, (counts.get(title) || 0) + 1);
    });
    return counts;
  }, [pages]);

  const { submittedForms, draftForms, pendingForms } = useMemo(() => {
    const submitted = [];
    const draft = [];
    const pending = [];

    pages.forEach((page) => {
      const submission = submissionsByPageId.get(page.id);
      if (submission) {
        submitted.push({ page, submission });
        return;
      }

      const storedDraft = user?.id ? loadFormDraft(user.id, page.id) : null;
      if (storedDraft) {
        draft.push({ page, draft: storedDraft });
        return;
      }

      pending.push({ page });
    });

    return {
      submittedForms: submitted,
      draftForms: draft,
      pendingForms: pending,
    };
  }, [pages, submissionsByPageId, user?.id]);

  const formFilterCounts = useMemo(
    () => ({
      all: pages.length,
      submitted: submittedForms.length,
      draft: draftForms.length,
      pending: pendingForms.length,
    }),
    [pages.length, submittedForms.length, draftForms.length, pendingForms.length],
  );

  const showSubmittedSection = formFilter === 'all' || formFilter === 'submitted';
  const showDraftSection = formFilter === 'all' || formFilter === 'draft';
  const showPendingSection = formFilter === 'all' || formFilter === 'pending';
  const showGroupHeaders = formFilter === 'all';

  const hasVisibleForms =
    (showSubmittedSection && submittedForms.length > 0) ||
    (showDraftSection && draftForms.length > 0) ||
    (showPendingSection && pendingForms.length > 0);

  const firstName = user?.user_name?.split(' ')[0] || 'there';
  const firstDraft = draftForms[0];

  const getPageSubtitle = (page) => {
    const title = getPageTitle(page);
    if ((pageTitleCounts.get(title) || 0) > 1) {
      return `Published ${formatPageDate(page.published_at || page.updated_at)}`;
    }
    return null;
  };

  const handleOpenForm = (page) => {
    if (!page.publish_slug) return;
    setEditSubmission(null);
    setEditingSubmissionId(null);
    setActiveTitle(getPageTitle(page));
    setActiveSlug(page.publish_slug);
  };

  const handleBackToHome = () => {
    setActiveSlug(null);
    setActiveTitle('');
    setSelectedSubmission(null);
    setEditSubmission(null);
    setEditingSubmissionId(null);
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

  const handleEditSubmission = async (submission) => {
    if (editingSubmissionId || openingSubmissionId) return;

    try {
      setEditingSubmissionId(submission.id);
      setError(null);
      const detail = await fetchSubmissionDetail(submission.id);
      const slug = detail.page?.publish_slug;
      if (!slug) {
        throw new Error('This form is no longer available to edit.');
      }
      setActiveTitle(getPageTitle(detail.page));
      setActiveSlug(slug);
      setEditSubmission(detail);
    } catch (err) {
      setError(err.message || 'Failed to open form for editing');
    } finally {
      setEditingSubmissionId(null);
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

  const renderFormCard = (page, { submission = null, draft = null } = {}) => {
    const isSubmitted = Boolean(submission);
    const isDraft = Boolean(draft);
    const statusClass = isSubmitted
      ? 'coachee-form-card--submitted'
      : isDraft
        ? 'coachee-form-card--draft'
        : 'coachee-form-card--pending';
    const subtitle = getPageSubtitle(page);

    const publishedText = `Published ${formatPageDate(page.published_at || page.updated_at)}`;
    const submittedText = isSubmitted
      ? `Submitted ${formatSubmittedAt(submission.submitted_at)}`
      : null;
    const metaText = isSubmitted
      ? null
      : isDraft
        ? `Draft saved ${formatSubmittedAt(draft.savedAt)}`
        : subtitle
          ? null
          : publishedText;

    return (
      <article
        key={page.id}
        className={`coachee-form-card coachee-form-card--static ${statusClass}`}
      >
        <div className="coachee-form-card-top">
          <div className="coachee-form-card-heading">
            <h5 className="coachee-form-card-title">{getPageTitle(page)}</h5>
            {subtitle && <p className="coachee-form-card-subtitle">{subtitle}</p>}
          </div>
          <span
            className={`coachee-form-card-badge${
              isSubmitted
                ? ' coachee-form-card-badge--submitted'
                : isDraft
                  ? ' coachee-form-card-badge--draft'
                  : ''
            }`}
          >
            {isSubmitted ? 'Submitted' : isDraft ? 'Draft' : 'Not started'}
          </span>
        </div>
        {isSubmitted ? (
          <div className="coachee-form-card-meta-group">
            {!subtitle && <p className="coachee-form-card-meta">{publishedText}</p>}
            <p className="coachee-form-card-meta">{submittedText}</p>
          </div>
        ) : (
          metaText && <p className="coachee-form-card-meta">{metaText}</p>
        )}
        <div className="coachee-form-card-actions">
          {isSubmitted ? (
            <>
              <button
                type="button"
                className="coachee-form-card-cta"
                onClick={() => handleOpenSubmission(submission)}
                disabled={Boolean(openingSubmissionId)}
              >
                {openingSubmissionId === submission.id ? 'Opening...' : 'View response'}
              </button>
              <button
                type="button"
                className="coachee-form-card-btn coachee-form-card-btn--secondary"
                onClick={() => handleOpenForm(page)}
                disabled={!page.publish_slug}
              >
                Fill out again
              </button>
            </>
          ) : (
            <button
              type="button"
              className="coachee-form-card-cta"
              onClick={() => handleOpenForm(page)}
              disabled={!page.publish_slug}
            >
              {isDraft ? 'Continue form' : 'Open form'}
            </button>
          )}
        </div>
      </article>
    );
  };

  const renderFormGroup = (title, items, renderItem) => {
    if (items.length === 0) return null;

    return (
      <div className="coachee-forms-group">
        {showGroupHeaders && (
          <div className="coachee-forms-group-header">
            <h4>{title}</h4>
            <span className="coachee-forms-count">
              {items.length} assessment{items.length === 1 ? '' : 's'}
            </span>
          </div>
        )}
        <div className="coachee-forms-grid">{items.map(renderItem)}</div>
      </div>
    );
  };

  if (selectedSubmission) {
    return (
      <div className="coachee-dashboard">
        <PortalHeader title="RYD Coachee Portal" />
        <main className="coachee-main coachee-main--form">
          <ResponseDetailView
            submission={selectedSubmission}
            onBack={handleBackToHome}
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
          <FormViewToolbar
            onBack={handleBackToHome}
            title={activeTitle}
            subtitle={editSubmission ? 'Editing your response' : undefined}
          />
          <div className="coachee-form-view">
            <PublishedPage
              slug={activeSlug}
              embedded
              onBack={handleBackToHome}
              editSubmission={editSubmission}
            />
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
          <div className="coachee-hero-content">
            <h2>Hello, {firstName}!</h2>
            <p className="coachee-hero-subtitle">
              Complete the assessments shared by your coach.
            </p>
          </div>
          {!loading && pages.length > 0 && (
            <div className="coachee-hero-stats">
              <span className="coachee-hero-stat coachee-hero-stat--submitted">
                <strong>{submittedForms.length}</strong> submitted
              </span>
              <span className="coachee-hero-stat coachee-hero-stat--draft">
                <strong>{draftForms.length}</strong> in progress
              </span>
              <span className="coachee-hero-stat coachee-hero-stat--pending">
                <strong>{pendingForms.length}</strong> to start
              </span>
            </div>
          )}
          {!loading && firstDraft && (
            <button
              type="button"
              className="coachee-hero-cta"
              onClick={() => handleOpenForm(firstDraft.page)}
            >
              Continue your draft — {getPageTitle(firstDraft.page)}
            </button>
          )}
        </section>

        <div className="coachee-dashboard-grid">
          <section className="coachee-forms-section">
            <div className="coachee-forms-header">
              <div>
                <h3>Your assessments</h3>
                <p className="coachee-section-desc">
                  Open, continue, or review forms shared with you.
                </p>
              </div>
              <span className="coachee-forms-count">
                {pages.length} assessment{pages.length === 1 ? '' : 's'}
              </span>
            </div>

            {!loading && !error && pages.length > 0 && (
              <div className="coachee-forms-filters" role="tablist" aria-label="Filter assessments">
                {FORM_FILTERS.map(({ id, label }) => {
                  const count = formFilterCounts[id];
                  const isEmpty = count === 0 && id !== 'all';

                  return (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={formFilter === id}
                      className={`coachee-forms-filter${
                        formFilter === id ? ' coachee-forms-filter--active' : ''
                      }${isEmpty ? ' coachee-forms-filter--empty' : ''}`}
                      onClick={() => setFormFilter(id)}
                    >
                      {label}
                      <span className="coachee-forms-filter-count">{count}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {loading && (
              <div className="coachee-forms-grid">
                <FormCardSkeleton />
                <FormCardSkeleton />
                <FormCardSkeleton />
              </div>
            )}
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
              <>
                {!hasVisibleForms && (
                  <div className="coachee-forms-empty coachee-forms-empty--filter">
                    <p>{EMPTY_FILTER_MESSAGES[formFilter]}</p>
                  </div>
                )}

                {showSubmittedSection &&
                  renderFormGroup('Submitted', submittedForms, ({ page, submission }) =>
                    renderFormCard(page, { submission }),
                  )}

                {showDraftSection &&
                  renderFormGroup('Draft', draftForms, ({ page, draft }) =>
                    renderFormCard(page, { draft }),
                  )}

                {showPendingSection &&
                  renderFormGroup('Pending', pendingForms, ({ page }) => renderFormCard(page))}
              </>
            )}
          </section>

          <section className="coachee-forms-section coachee-responses-section">
            <div className="coachee-forms-header">
              <div>
                <h3>Your submitted responses</h3>
                <p className="coachee-section-desc">
                  View, edit, or download responses you&apos;ve already sent.
                </p>
              </div>
              <span className="coachee-forms-count">
                {submissions.length} response{submissions.length === 1 ? '' : 's'}
              </span>
            </div>

            {loading && (
              <div className="coachee-responses-list">
                <div className="coachee-responses-item coachee-responses-item--skeleton">
                  <div className="coachee-skeleton coachee-skeleton--title" />
                  <div className="coachee-skeleton coachee-skeleton--meta" />
                </div>
              </div>
            )}

            {!loading && !error && submissions.length === 0 && (
              <div className="coachee-forms-empty">
                <p>You haven&apos;t submitted any responses yet. Complete an assessment to get started.</p>
              </div>
            )}

            {!loading && submissions.length > 0 && (
              <ul className="coachee-responses-list">
                {submissions.map((submission) => (
                  <li key={submission.id} className="coachee-responses-row">
                    <div className="coachee-responses-item">
                      <div className="coachee-responses-item-info">
                        <span className="coachee-responses-item-title">
                          {getSubmissionTitle(submission)}
                        </span>
                        <span className="coachee-responses-item-date">
                          {formatSubmittedAt(submission.submitted_at)}
                        </span>
                      </div>
                      <div className="coachee-responses-item-actions">
                        <button
                          type="button"
                          className="coachee-responses-item-action"
                          onClick={() => handleOpenSubmission(submission)}
                          disabled={Boolean(openingSubmissionId) || Boolean(editingSubmissionId)}
                        >
                          {openingSubmissionId === submission.id ? 'Opening...' : 'View'}
                        </button>
                        <button
                          type="button"
                          className="coachee-responses-item-action"
                          onClick={() => handleEditSubmission(submission)}
                          disabled={Boolean(openingSubmissionId) || Boolean(editingSubmissionId)}
                        >
                          {editingSubmissionId === submission.id ? 'Opening...' : 'Edit'}
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="coachee-responses-download"
                      onClick={(event) => handleDownloadSubmission(submission, event)}
                      disabled={
                        Boolean(openingSubmissionId) ||
                        Boolean(editingSubmissionId) ||
                        downloadingId === submission.id
                      }
                      title="Download response as PDF"
                      aria-label="Download response as PDF"
                    >
                      {downloadingId === submission.id ? '...' : '↓ PDF'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
