export default function Sidebar({ view, setView, onAdd }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">DOGAN<span>Progressive Overload</span></div>
      <div className="nav-links">
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
      </div>
    </aside>
  );
}
