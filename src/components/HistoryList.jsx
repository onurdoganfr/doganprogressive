import { isTreadmill, isJumpRope, getDisplayName, getTagClass, getOrderedExercises } from '../utils/workout.js';

export default function HistoryList({ history, onSelect, onDelete }) {
  const sorted = [...history].reverse();

  // Group by month
  const groups = [];
  sorted.forEach(day => {
    const d = new Date(day.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    let g = groups.find(x => x.key === key);
    if (!g) { g = { key, label, days: [] }; groups.push(g); }
    g.days.push(day);
  });

  return (
    <>
      <div className="hist-page-header">
        <div>
          <div className="hist-page-eyebrow">Training Log</div>
          <h1 className="hist-page-title">History</h1>
        </div>
        <div className="hist-page-meta">
          <span className="hist-count-pill">{sorted.length} sessions</span>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📋</div>No workouts recorded yet.
        </div>
      ) : (
        <div className="hist-groups">
          {groups.map(group => (
            <div key={group.key} className="hist-month-group">
              <div className="hist-month-header">
                <span className="hist-month-label">{group.label}</span>
                <span className="hist-month-count">{group.days.length}</span>
              </div>
              <div className="hist-list">
                {group.days.map(day => {
                  const d = new Date(day.date);
                  const dayNum  = d.getDate();
                  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                  const tagClass = getTagClass(day);
                  const displayName = getDisplayName(day);

                  const logged = Object.entries(day.data).filter(([n, ex]) =>
                    n !== '__order' && (
                      isTreadmill(n) ? ex.speed !== '' || ex.incline !== '' || ex.duration !== ''
                      : isJumpRope(n) ? ex.jumps !== ''
                      : ex.sets?.some(s => s.weight !== '' || s.reps !== '')
                    )
                  ).length;

                  // First 3 exercise names as preview
                  const exNames = getOrderedExercises(day.data).slice(0, 3).map(([n]) => n);

                  return (
                    <div key={day.id} className="hist-entry" onClick={() => onSelect(day)}>
                      {/* Date stamp */}
                      <div className="hist-datestamp">
                        <div className="hist-day-num">{dayNum}</div>
                        <div className="hist-day-name">{dayName}</div>
                      </div>

                      {/* Divider */}
                      <div className="hist-entry-divider" />

                      {/* Content */}
                      <div className="hist-entry-body">
                        <div className="hist-entry-top">
                          <span className={`day-tag ${tagClass}`}>{displayName}</span>
                          <span className="hist-ex-count">{logged} exercise{logged !== 1 ? 's' : ''}</span>
                        </div>
                        {exNames.length > 0 && (
                          <div className="hist-ex-preview">
                            {exNames.map(name => (
                              <span key={name} className="hist-ex-chip">{name}</span>
                            ))}
                            {logged > 3 && <span className="hist-ex-chip hist-ex-chip--more">+{logged - 3}</span>}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="hist-entry-actions">
                        <button
                          className="hist-delete"
                          title="Delete"
                          onClick={e => { e.stopPropagation(); onDelete(day.id); }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                            <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                        <svg className="hist-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
