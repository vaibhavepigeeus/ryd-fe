import CoacheeHeader from './CoacheeHeader';
import CoacheeSidebar from './CoacheeSidebar';
import '../admin/AdminLayout.css';
import './CoacheeLayout.css';

export default function CoacheeLayout({
  activeSection = 'dashboard',
  onNavigate,
  mainClassName = '',
  children,
}) {
  return (
    <div className="admin-layout coachee-layout">
      <CoacheeHeader />
      <div className="admin-layout-body">
        <CoacheeSidebar activeSection={activeSection} onNavigate={onNavigate} />
        <main className={`admin-main ${mainClassName}`.trim()}>{children}</main>
      </div>
    </div>
  );
}
