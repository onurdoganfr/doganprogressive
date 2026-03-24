function getInitials(user) {
  const name = user?.user_metadata?.full_name || user?.email || '';
  return name.split(/[\s@]+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
}

export default function Sidebar({ view, setView, onAdd, theme, onToggleTheme, user, onProfile, onSignOut }) {
  const initials = getInitials(user);

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
          <button className={`nav-link${view === 'records' ? ' active' : ''}`} onClick={() => setView('records')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>Records
          </button>
          <button className={`nav-link${view === 'measurements' ? ' active' : ''}`} onClick={() => setView('measurements')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/>
              <line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
            </svg>Measurements
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
              <button className="sidebar-user-btn" onClick={() => onProfile?.()}>
                <div className="sidebar-avatar">{initials}</div>
                <div className="sidebar-user-info">
                  <div className="sidebar-user-name">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</div>
                  <div className="sidebar-user-email">{user.email}</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile bottom bar ─────────────────────────────────── */}
      <nav className="mobile-nav">
        <button
          className={`mobile-nav-btn${view === 'dashboard' ? ' active' : ''}`}
          onClick={() => setView('dashboard')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
          </svg>
          <span>Home</span>
        </button>

        <button
          className={`mobile-nav-btn${(view === 'history' || view === 'detail') ? ' active' : ''}`}
          onClick={() => setView('history')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/>
          </svg>
          <span>History</span>
        </button>

        <button className="mobile-add-btn" onClick={onAdd}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>Add</span>
        </button>

        <button
          className={`mobile-nav-btn${view === 'records' ? ' active' : ''}`}
          onClick={() => setView('records')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span>PR</span>
        </button>

        <button
          className={`mobile-nav-btn${view === 'measurements' ? ' active' : ''}`}
          onClick={() => setView('measurements')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/>
            <line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
          </svg>
          <span>Measure</span>
        </button>

        <button
          className={`mobile-nav-btn mobile-nav-avatar${view === 'profile' ? ' active' : ''}`}
          onClick={() => onProfile?.()}
        >
          <div className="mobile-nav-initials">{initials}</div>
          <span>Profile</span>
        </button>
      </nav>
    </>
  );
}
