import AccountMenu from '../layout/AccountMenu';
import './CoachLayout.css';

export default function CoachHeader() {
  return (
    <header className="coach-header">
      <div className="coach-header-left">
        <div className="coach-header-logo">R</div>
        <span className="coach-header-site">RYD Coach</span>
      </div>

      <div className="coach-header-right">
        <AccountMenu />
      </div>
    </header>
  );
}
