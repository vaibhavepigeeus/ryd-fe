import { useCallback, useEffect, useState } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { fetchPages, loadPage } from '../../services/pageApi';
import './PageStartScreen.css';

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

function getPageTitle(page) {
  return page.page_name || page.layout_data?.pageTitle || 'Untitled Page';
}

function getElementCount(page) {
  return page.layout_data?.elements?.length ?? 0;
}

export default function PageStartScreen() {
  const { state, dispatch } = useBuilder();
  const [view, setView] = useState('home');
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openingId, setOpeningId] = useState(null);

  const refreshPages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await fetchPages();
      const sorted = [...list].sort(
        (a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0)
      );
      setPages(sorted);
    } catch (err) {
      setError(err.message || 'Failed to load pages');
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'existing') {
      refreshPages();
    }
  }, [view, refreshPages]);

  const goToBuild = () => {
    dispatch({ type: 'SET_TAB', payload: 'Build' });
  };

  const handleStartScratch = () => {
    dispatch({ type: 'NEW_PAGE' });
    goToBuild();
  };

  const handleContinueCurrent = () => {
    goToBuild();
  };

  const handleOpenPage = async (page) => {
    if (openingId) return;

    try {
      setOpeningId(page.id);
      setError(null);
      const fullPage = page.layout_data?.elements ? page : await loadPage(page.id);
      dispatch({ type: 'LOAD_PAGE', payload: fullPage });
      goToBuild();
    } catch (err) {
      setError(err.message || 'Failed to open page');
    } finally {
      setOpeningId(null);
    }
  };

  const currentPageName = state.pageTitle || (state.pageId ? `Page #${state.pageId}` : null);

  return (
    <main className="page-start-screen">
      <div className="page-start-screen-inner">
        {view === 'home' ? (
          <>
            <header className="page-start-header">
              <h1>Get started</h1>
              <p>Start a new form page or continue with something you have already built.</p>
            </header>

            {state.pageId && (
              <button type="button" className="page-start-continue" onClick={handleContinueCurrent}>
                <span className="page-start-continue-label">Continue editing</span>
                <span className="page-start-continue-name">{currentPageName}</span>
                <span className="page-start-continue-action">Back to builder →</span>
              </button>
            )}

            <div className="page-start-choices">
              <button type="button" className="page-start-card" onClick={handleStartScratch}>
                <span className="page-start-card-icon" aria-hidden="true">
                  ✦
                </span>
                <span className="page-start-card-title">Start from scratch</span>
                <span className="page-start-card-desc">
                  Open a blank canvas and drag components to build a new page.
                </span>
              </button>

              <button
                type="button"
                className="page-start-card page-start-card--existing"
                onClick={() => setView('existing')}
              >
                <span className="page-start-card-icon" aria-hidden="true">
                  ◫
                </span>
                <span className="page-start-card-title">Open existing page</span>
                <span className="page-start-card-desc">
                  Pick from your saved pages and keep editing where you left off.
                </span>
              </button>
            </div>
          </>
        ) : (
          <>
            <header className="page-start-header page-start-header--list">
              <button type="button" className="page-start-back" onClick={() => setView('home')}>
                ← Back
              </button>
              <h1>Your saved pages</h1>
              <p>Select a page to open it in the builder.</p>
            </header>

            {loading && !pages.length && (
              <p className="page-start-status">Loading saved pages...</p>
            )}
            {error && <p className="page-start-status page-start-status--error">{error}</p>}

            {!loading && !error && pages.length === 0 && (
              <div className="page-start-empty">
                <p>No saved pages yet.</p>
                <button type="button" className="page-start-empty-btn" onClick={handleStartScratch}>
                  Start from scratch
                </button>
              </div>
            )}

            {pages.length > 0 && (
              <div className="page-start-grid">
                {pages.map((page) => {
                  const isActive = String(state.pageId) === String(page.id);
                  const isOpening = openingId === page.id;

                  return (
                    <button
                      key={page.id}
                      type="button"
                      className={`page-start-page-card${isActive ? ' page-start-page-card--active' : ''}`}
                      onClick={() => handleOpenPage(page)}
                      disabled={Boolean(openingId)}
                    >
                      <span className="page-start-page-card-top">
                        <span className="page-start-page-card-title">{getPageTitle(page)}</span>
                        {page.is_published && (
                          <span className="page-start-page-card-badge">Published</span>
                        )}
                      </span>
                      <span className="page-start-page-card-meta">
                        {getElementCount(page)} blocks · Updated {formatPageDate(page.updated_at)}
                      </span>
                      <span className="page-start-page-card-action">
                        {isOpening ? 'Opening...' : isActive ? 'Currently open' : 'Open page →'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
