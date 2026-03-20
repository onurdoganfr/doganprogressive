import { formatDate } from '../utils/date.js';
import { getDisplayName, getTagClass } from '../utils/workout.js';

export default function LastSessionCard({ session }) {
  const name     = getDisplayName(session);
  const tagClass = getTagClass(session);
  const exercises = Object.entries(session.data)
    .filter(([, ex]) => ex.sets?.some(s => s.weight !== '' && s.weight != null));

  return (
    <div className="last-session-card">
      <div className="ls-header">
        <span className={`day-tag ${tagClass}`}>{name}</span>
        <span className="ls-date">{formatDate(session.date)}</span>
        <span className="ls-count">{exercises.length} exercises</span>
      </div>
      {exercises.length > 0 ? (
        <div className="ls-grid">
          {exercises.slice(0, 6).map(([exName, ex]) => {
            const sets = ex.sets.filter(s => s?.weight !== '' && s?.weight != null);
            if (!sets.length) return null;
            const best = sets.reduce((b, s) => (parseFloat(s.weight) || 0) > (parseFloat(b.weight) || 0) ? s : b);
            return (
              <div key={exName} className="ls-ex-row">
                <span className="ls-ex-name">{exName}</span>
                <span className="ls-ex-val">{best.weight} kg × {best.reps || '—'}</span>
              </div>
            );
          })}
          {exercises.length > 6 && <div className="ls-more">+{exercises.length - 6} more</div>}
        </div>
      ) : (
        <div style={{ fontSize: '0.78rem', color: '#2a2a2a' }}>No exercise data recorded</div>
      )}
    </div>
  );
}
