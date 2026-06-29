import { PALETTE_SECTIONS, DRAG_TYPES } from '../../constants/builder';
import './Sidebar.css';

export default function Sidebar({ width = 190 }) {
  const handleDragStart = (e, type) => {
    e.dataTransfer.setData(DRAG_TYPES.COMPONENT, type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <aside className="sidebar" style={{ width }}>
      <div className="sidebar-scroll">
        {PALETTE_SECTIONS.map((section) => (
          <div key={section.id} className="sidebar-section">
            <h3 className="sidebar-section-label">{section.label}</h3>
            <div className="sidebar-grid">
              {section.items.map((item) => (
                <div
                  key={item.type}
                  className="palette-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.type)}
                >
                  <span className="palette-icon">{item.icon}</span>
                  <span className="palette-label">{item.label}</span>
                  {item.badge && <span className="palette-badge">{item.badge}</span>}
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>
    </aside>
  );
}
