import { useState } from 'react';
import { NAV_TABS } from '../../constants/builder';
import { useBuilder } from '../../context/BuilderContext';
import {
  getPublishedPageUrl,
  publishPage,
  savePage,
} from '../../services/pageApi';
import './PublishModal.css';
import './TopBar.css';

function PublishModal({ url, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select not implemented
    }
  };

  return (
    <div className="publish-modal-overlay" onClick={onClose}>
      <div className="publish-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Form Published!</h2>
        <p>Share this link so others can fill out the form:</p>
        <div className="publish-modal-link-row">
          <input className="publish-modal-link" type="text" value={url} readOnly />
          <button type="button" className="publish-modal-copy" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <a className="publish-modal-open" href={url} target="_blank" rel="noreferrer">
          Open published page →
        </a>
        <button type="button" className="publish-modal-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default function TopBar() {
  const { state, dispatch } = useBuilder();
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishUrl, setPublishUrl] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    dispatch({ type: 'SET_SAVE_STATUS', payload: { status: 'saving', message: 'Saving...' } });

    try {
      const saved = await savePage(state, state.pageId);
      dispatch({ type: 'SET_PAGE_ID', payload: saved.id });
      dispatch({
        type: 'SET_SAVE_STATUS',
        payload: { status: 'saved', message: 'Page saved successfully' },
      });

      setTimeout(() => {
        dispatch({ type: 'SET_SAVE_STATUS', payload: { status: 'idle', message: '' } });
      }, 3000);
    } catch (err) {
      dispatch({
        type: 'SET_SAVE_STATUS',
        payload: { status: 'error', message: err.message || 'Failed to save page' },
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    dispatch({ type: 'SET_SAVE_STATUS', payload: { status: 'saving', message: 'Publishing...' } });

    try {
      let pageId = state.pageId;
      if (!pageId) {
        const saved = await savePage(state);
        pageId = saved.id;
        dispatch({ type: 'SET_PAGE_ID', payload: pageId });
      } else {
        await savePage(state, pageId);
      }

      const result = await publishPage(pageId);
      dispatch({ type: 'SET_PUBLISH_SLUG', payload: result.publish_slug });
      const url = getPublishedPageUrl(result.publish_slug);
      setPublishUrl(url);
      dispatch({
        type: 'SET_SAVE_STATUS',
        payload: { status: 'saved', message: 'Published successfully' },
      });
    } catch (err) {
      dispatch({
        type: 'SET_SAVE_STATUS',
        payload: { status: 'error', message: err.message || 'Failed to publish' },
      });
    } finally {
      setPublishing(false);
    }
  };

  const saveLabel = saving
    ? 'Saving...'
    : state.saveStatus === 'saved'
      ? 'Saved!'
      : 'Save';

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <button className="topbar-exit" type="button" aria-label="Exit editor">
            ✕
          </button>
          <div className="topbar-logo">R</div>
        </div>

        <nav className="topbar-nav">
          {NAV_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`topbar-tab ${state.activeTab === tab ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_TAB', payload: tab })}
            >
              {tab}
            </button>
          ))}
          <button type="button" className="topbar-tab topbar-help">
            Help ▾
          </button>
        </nav>

        <div className="topbar-right">
          {state.saveMessage && (
            <span className={`topbar-save-message topbar-save-message--${state.saveStatus}`}>
              {state.saveMessage}
            </span>
          )}
          <div className="preview-toggle">
            <button
              type="button"
              className={state.previewMode === 'desktop' ? 'active' : ''}
              onClick={() => dispatch({ type: 'SET_PREVIEW_MODE', payload: 'desktop' })}
              aria-label="Desktop preview"
            >
              🖥
            </button>
            <button
              type="button"
              className={state.previewMode === 'mobile' ? 'active' : ''}
              onClick={() => dispatch({ type: 'SET_PREVIEW_MODE', payload: 'mobile' })}
              aria-label="Mobile preview"
            >
              📱
            </button>
          </div>
          <button
            type="button"
            className={`btn-save ${state.saveStatus === 'saved' ? 'btn-save--success' : ''}`}
            onClick={handleSave}
            disabled={saving || publishing}
          >
            {saveLabel}
          </button>
          <button
            type="button"
            className="btn-publish"
            onClick={handlePublish}
            disabled={saving || publishing}
          >
            {publishing ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </header>

      {publishUrl && (
        <PublishModal url={publishUrl} onClose={() => setPublishUrl(null)} />
      )}
    </>
  );
}
