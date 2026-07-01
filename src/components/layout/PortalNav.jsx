import './PortalLayout.css';

export default function PortalNav({ items, activeId, onNavigate }) {
  return (
    <nav className="portal-nav" aria-label="Portal navigation">
      {items.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className={`portal-nav-item ${activeId === id ? 'portal-nav-item--active' : ''}`}
          onClick={() => onNavigate(id)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
