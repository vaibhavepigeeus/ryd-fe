import CoachHeader from './CoachHeader';
import CoachSidebar from './CoachSidebar';
import './CoachLayout.css';

export default function CoachLayout({ activeSection, onNavigate, children }) {
  return (
    <div className="coach-layout">
      <CoachHeader />
      <div className="coach-layout-body">
        <CoachSidebar activeSection={activeSection} onNavigate={onNavigate} />
        <main className="coach-main">{children}</main>
      </div>
    </div>
  );
}
