import { NAV_TABS } from '../../constants/builder';
import { useBuilder } from '../../context/BuilderContext';
import './TopBar.css';

export default function TopBar() {
  const { state, dispatch } = useBuilder();

  return (
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
        <button type="button" className="btn-upgrade">
          Upgrade
        </button>
        <button type="button" className="btn-publish">
          Publish
        </button>
      </div>
    </header>
  );
}
