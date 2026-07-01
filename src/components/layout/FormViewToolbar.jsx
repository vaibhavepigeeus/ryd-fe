import './FormViewToolbar.css';

export default function FormViewToolbar({
  onBack,
  backLabel = 'Back to my forms',
  title,
  subtitle,
  children = null,
}) {
  return (
    <header className="form-view-toolbar">
      <button type="button" className="form-view-toolbar-back" onClick={onBack}>
        <span className="form-view-toolbar-back-icon" aria-hidden="true">
          ←
        </span>
        <span className="form-view-toolbar-back-label">{backLabel}</span>
      </button>

      <div className="form-view-toolbar-center">
        {title && <h1 className="form-view-toolbar-title">{title}</h1>}
        {subtitle && <p className="form-view-toolbar-subtitle">{subtitle}</p>}
      </div>

      {children ? <div className="form-view-toolbar-actions">{children}</div> : <div />}
    </header>
  );
}
