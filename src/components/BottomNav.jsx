function getInitials(user) {
  const name = user?.user_metadata?.full_name || user?.email || '';
  return name.split(/[\s@]+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '?';
}

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
  },
  {
    id: 'add',
    label: 'Add',
    isAdd: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="22" height="22">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    ),
  },
  {
    id: 'history',
    label: 'History',
    matchViews: ['history', 'detail'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
        <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/>
      </svg>
    ),
  },
  {
    id: 'records',
    label: 'PR',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
  },
  {
    id: 'measurements',
    label: 'Measure',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
        <path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/>
        <line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
      </svg>
    ),
  },
];

export default function BottomNav({ view, setView, onAdd, showAdd, user, onProfile }) {
  const activeView = showAdd ? 'add' : view;
  const initials   = getInitials(user);

  function isActive(item) {
    if (item.matchViews) return item.matchViews.includes(activeView);
    return activeView === item.id;
  }

  function handleClick(item) {
    if (item.isAdd) onAdd();
    else setView(item.id);
  }

  return (
    <nav className="bnav">
      <div className="bnav-pill">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`bnav-item${isActive(item) ? ' bnav-item--active' : ''}${item.isAdd ? ' bnav-item--add' : ''}`}
            onClick={() => handleClick(item)}
            aria-label={item.label}
          >
            <span className="bnav-icon-wrap">{item.icon}</span>
            <span className="bnav-label">{item.label}</span>
          </button>
        ))}
      </div>

      <button
        className={`bnav-avatar-btn${activeView === 'profile' ? ' bnav-avatar-btn--active' : ''}`}
        onClick={() => onProfile?.()}
        aria-label="Profile"
      >
        {initials}
      </button>
    </nav>
  );
}
