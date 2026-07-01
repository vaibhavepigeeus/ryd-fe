import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { assignCoach, fetchCoaches } from '../../services/coacheesApi';
import ChangePasswordDialog from './ChangePasswordDialog';
import './AccountMenu.css';

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

export default function AccountMenu() {
  const { user, logout, isCoachee, refreshAuth } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [coachPopupOpen, setCoachPopupOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [coaches, setCoaches] = useState([]);
  const [coachesLoading, setCoachesLoading] = useState(false);
  const [selectedCoachId, setSelectedCoachId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const menuRef = useRef(null);

  const closeDropdown = useCallback(() => {
    setDropdownOpen(false);
  }, []);

  const closeCoachPopup = useCallback(() => {
    setCoachPopupOpen(false);
    setError(null);
    setSelectedCoachId('');
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return undefined;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [dropdownOpen, closeDropdown]);

  useEffect(() => {
    if (!coachPopupOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeCoachPopup();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [coachPopupOpen, closeCoachPopup]);

  const loadCoaches = useCallback(async () => {
    try {
      setCoachesLoading(true);
      setError(null);
      const data = await fetchCoaches();
      setCoaches(data.coaches || []);
    } catch (err) {
      setError(err.message || 'Failed to load coaches');
      setCoaches([]);
    } finally {
      setCoachesLoading(false);
    }
  }, []);

  const openCoachPopup = async () => {
    closeDropdown();
    setCoachPopupOpen(true);
    setError(null);
    setSelectedCoachId(user?.coach_id ? String(user.coach_id) : '');
    await loadCoaches();
  };

  const openChangePassword = () => {
    closeDropdown();
    setChangePasswordOpen(true);
  };

  const handleSaveCoach = async () => {
    if (!selectedCoachId) {
      setError('Please select a coach.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await assignCoach(Number(selectedCoachId));
      await refreshAuth();
      closeCoachPopup();
    } catch (err) {
      setError(err.message || 'Failed to update coach');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    closeDropdown();
    logout();
  };

  return (
    <div className="account-menu" ref={menuRef}>
      <button
        type="button"
        className="account-menu-trigger"
        onClick={() => setDropdownOpen((prev) => !prev)}
        aria-expanded={dropdownOpen}
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        <span className="account-menu-avatar">{getInitials(user?.user_name)}</span>
      </button>

      {dropdownOpen && (
        <div className="account-menu-dropdown" role="menu">
          <button type="button" className="account-menu-dropdown-item" onClick={openChangePassword}>
            Change password
          </button>
          {isCoachee && (
            <button type="button" className="account-menu-dropdown-item" onClick={openCoachPopup}>
              Coach
            </button>
          )}
          <button type="button" className="account-menu-dropdown-item account-menu-dropdown-item--logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}

      <ChangePasswordDialog
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        userId={user?.id}
      />

      {coachPopupOpen && (
        <>
          <div
            className="account-menu-backdrop"
            aria-hidden="true"
            onClick={closeCoachPopup}
          />
          <div className="account-menu-popup" role="dialog" aria-label="Coach settings">
            <div className="account-menu-coach-header">
              <h3>{user?.coach_name ? 'Change coach' : 'Select your coach'}</h3>
            </div>

            {user?.coach_name && (
              <div className="account-menu-current-coach">
                <span className="account-menu-current-coach-label">Current coach</span>
                <strong>{user.coach_name}</strong>
              </div>
            )}

            {coachesLoading && <p className="account-menu-status">Loading coaches...</p>}
            {error && <p className="account-menu-error">{error}</p>}

            {!coachesLoading && (
              <label className="account-menu-select-wrap">
                <span className="account-menu-select-label">Choose a coach</span>
                <select
                  className="account-menu-select"
                  value={selectedCoachId}
                  onChange={(event) => setSelectedCoachId(event.target.value)}
                  disabled={saving}
                >
                  <option value="">Select a coach</option>
                  {coaches.map((coach) => (
                    <option key={coach.id} value={coach.id}>
                      {coach.user_name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="account-menu-coach-actions">
              <button
                type="button"
                className="account-menu-coach-cancel"
                onClick={closeCoachPopup}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="account-menu-coach-save"
                onClick={handleSaveCoach}
                disabled={saving || coachesLoading || !selectedCoachId}
              >
                {saving ? 'Saving...' : user?.coach_name ? 'Change coach' : 'Save coach'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
