import { useState } from 'react';

function getInitials(user) {
  const name = user?.user_metadata?.full_name || user?.email || '';
  return name.split(/[\s@]+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
}

function getDisplayName(user) {
  return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
}

export default function Sidebar({ view, setView, onAdd, theme, onToggleTheme, user, onProfile, onSignOut }) {
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const initials    = getInitials(user);
  const displayName = getDisplayName(user);

  function navigate(target) {
    setView(target);
    setMenuOpen(false);
  }

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo">DOGAN<span>Progressive Overload</span></div>

        <div className="nav-links desktop-nav">
          <button className="add-workout-btn" onClick={onAdd}>
            <span>+</span>
            <span className="add-btn-label">Add Workout</span>
          </button>
          <button className={`nav-link${view === 'dashboard' ? ' active' : ''}`} onClick={() => setView('dashboard')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
            </svg>Dashboard
          </button>
          <button className={`nav-link${(view === 'history' || view === 'detail') ? ' active' : ''}`} onClick={() => setView('history')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/>
            </svg>History
          </button>
          <button className={`nav-link${view === 'measurements' ? ' active' : ''}`} onClick={() => setView('measurements')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/>
              <line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
            </svg>Measurements
          </button>
          <button className={`nav-link${view === 'settings' ? ' active' : ''}`} onClick={() => setView('settings')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>Settings
          </button>
        </div>

        {/* ── Desktop bottom: user card + theme ─────────────────── */}
        <div className="sidebar-bottom">
          <button className="theme-toggle-btn" onClick={onToggleTheme}>
            {theme === 'dark' ? (
              <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>Light mode</>
            ) : (
              <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>Dark mode</>
            )}
          </button>

          {user && (
            <div className="sidebar-user-wrap">
              <button className="sidebar-user-btn" onClick={() => { onProfile?.(); setUserMenuOpen(false); }}>
                <div className="sidebar-avatar">{initials}</div>
                <div className="sidebar-user-info">
                  <div className="sidebar-user-name">{displayName}</div>
                  <div className="sidebar-user-email">{user.email}</div>
                </div>
                <svg className={`sidebar-chevron${userMenuOpen ? ' open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile bottom bar ─────────────────────────────────── */}
      <nav className="mobile-nav">
        <div className="mobile-nav-spacer" />
        <button className="mobile-add-btn" onClick={onAdd}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>Add Workout</span>
        </button>
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(o => !o)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </nav>

      {/* ── Slide-up menu ─────────────────────────────────────── */}
      {menuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="mobile-menu-panel" onClick={e => e.stopPropagation()}>
            <div className="mobile-menu-handle" />

            {/* User card in menu */}
            {user && (
              <div className="mobile-menu-user" onClick={() => { onProfile?.(); setMenuOpen(false); }} style={{ cursor: 'pointer' }}>
                <div className="sidebar-avatar">{initials}</div>
                <div className="sidebar-user-info">
                  <div className="sidebar-user-name">{displayName}</div>
                  <div className="sidebar-user-email">{user.email}</div>
                </div>
                <button className="mobile-menu-signout" onClick={e => { e.stopPropagation(); onSignOut(); }} title="Sign Out">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </button>
              </div>
            )}

            <button className={`mobile-menu-item${view === 'dashboard' ? ' active' : ''}`} onClick={() => navigate('dashboard')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
              </svg>
              Dashboard
              {view === 'dashboard' && <span className="mobile-menu-dot" />}
            </button>
            <button className={`mobile-menu-item${(view === 'history' || view === 'detail') ? ' active' : ''}`} onClick={() => navigate('history')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/>
              </svg>
              History
              {(view === 'history' || view === 'detail') && <span className="mobile-menu-dot" />}
            </button>
            <button className={`mobile-menu-item${view === 'measurements' ? ' active' : ''}`} onClick={() => navigate('measurements')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/>
                <line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
              </svg>
              Measurements
              {view === 'measurements' && <span className="mobile-menu-dot" />}
            </button>
            <button className={`mobile-menu-item${view === 'settings' ? ' active' : ''}`} onClick={() => navigate('settings')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Settings
              {view === 'settings' && <span className="mobile-menu-dot" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
