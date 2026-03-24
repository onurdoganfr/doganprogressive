import { useState } from 'react';

const ITEMS = [
  {
    id: 'add',
    label: 'Add Workout',
    isAdd: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="22" height="22">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    ),
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
  },
  {
    id: 'history',
    label: 'History',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
        <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/>
      </svg>
    ),
  },
  {
    id: 'records',
    label: 'Records',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
  },
  {
    id: 'measurements',
    label: 'Measurements',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
        <path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/>
        <line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
];

const STEP = 62; // px between items

export default function FluidMenu({ view, setView, onAdd, showAdd }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeView = showAdd ? 'add' : view;

  function handleItemClick(item) {
    if (item.isAdd) {
      onAdd();
    } else {
      setView(item.id);
    }
    setIsExpanded(false);
  }

  // Items are rendered in reverse DOM order so lower z-index items are in DOM first,
  // but we control z-index explicitly. Rendered back-to-front so trigger sits on top.
  return (
    <div className="fluid-fab">
      {isExpanded && (
        <div className="fluid-fab-backdrop" onClick={() => setIsExpanded(false)} />
      )}
      <div className="fluid-fab-container" data-expanded={String(isExpanded)}>
        {/* Nav items — all start at position 0 behind trigger, slide up on expand */}
        {[...ITEMS].reverse().map((item) => {
          const fwdIdx = ITEMS.indexOf(item); // 0 = closest to trigger (bottom)
          const isTopmost = fwdIdx === ITEMS.length - 1;
          return (
            <button
              key={item.id}
              className={`fluid-fab-item${item.isAdd ? ' fluid-fab-item--add' : ''}${activeView === item.id ? ' fluid-fab-item--active' : ''}`}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                transform: `translateY(${isExpanded ? -(fwdIdx + 1) * STEP : 0}px)`,
                opacity: isExpanded ? 1 : 0,
                zIndex: 49 - fwdIdx,
                clipPath: isTopmost ? 'circle(50% at 50% 50%)' : 'circle(50% at 50% 60%)',
                transition: `transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${isExpanded ? '250ms' : '150ms'}`,
                pointerEvents: isExpanded ? 'auto' : 'none',
                willChange: 'transform, opacity',
              }}
              onClick={() => handleItemClick(item)}
              title={item.label}
            >
              {item.icon}
            </button>
          );
        })}

        {/* Trigger — always on top */}
        <button
          className="fluid-fab-item fluid-fab-trigger"
          onClick={() => setIsExpanded(e => !e)}
          aria-label={isExpanded ? 'Close menu' : 'Open menu'}
          aria-expanded={isExpanded}
        >
          <span className="fab-icon fab-icon-menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
              <line x1="4" y1="7" x2="20" y2="7"/>
              <line x1="4" y1="12" x2="20" y2="12"/>
              <line x1="4" y1="17" x2="20" y2="17"/>
            </svg>
          </span>
          <span className="fab-icon fab-icon-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}
