import { formatDate } from '../utils/date.js';
import { isTreadmill, isJumpRope, getDisplayName, getTagClass } from '../utils/workout.js';

export default function HistoryList({ history, onSelect, onDelete }) {
  const sorted = [...history].reverse();
  return (
    <>
      <div className="page-header">
        <div className="page-title">History</div>
        <div className="page-sub">{sorted.length} session{sorted.length !== 1 ? 's' : ''} recorded</div>
      </div>
      {sorted.length === 0
        ? <div className="empty-state"><div className="icon">📋</div>No workouts recorded yet.</div>
        : <div className="hist-table">
            {sorted.map(day => {
              const logged = Object.entries(day.data).filter(([n, ex]) =>
                n !== '__order' && (
                  isTreadmill(n) ? ex.speed !== '' || ex.incline !== '' || ex.duration !== ''
                  : isJumpRope(n) ? ex.jumps !== ''
                  : ex.sets?.some(s => s.weight !== '' || s.reps !== '')
                )
              ).length;
              return (
                <div key={day.id} className="hist-row" onClick={() => onSelect(day)}>
                  <div className="hist-left">
                    <span className={`day-tag ${getTagClass(day)}`}>{getDisplayName(day)}</span>
                    <div>
                      <div className="hist-date-main">{formatDate(day.date)}</div>
                      <div className="hist-sub">{logged} exercise{logged !== 1 ? 's' : ''} logged</div>
                    </div>
                  </div>
                  <div className="hist-right">
                    <button className="hist-delete" title="Delete" onClick={e => { e.stopPropagation(); onDelete(day.id); }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                        <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                    <span className="hist-arrow">›</span>
                  </div>
                </div>
              );
            })}
          </div>
      }
    </>
  );
}
