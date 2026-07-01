import AccountMenu from '../layout/AccountMenu';
import './PortalHeader.css';

export default function PortalHeader({ title }) {
  return (
    <header className="portal-header">
      <div className="portal-header-brand">
        <div className="portal-header-logo">R</div>
        <h1>{title}</h1>
      </div>
      <AccountMenu />
    </header>
  );
}
