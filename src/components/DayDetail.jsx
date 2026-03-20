import { formatDate } from '../utils/date.js';
import { isTreadmill, isJumpRope, getDisplayName, getTagClass } from '../utils/workout.js';

export default function DayDetail({ day, onBack }) {
  return (
    <>
      <button className="back-btn" onClick={onBack}>← Back to History</button>
      <div className="page-header">
        <span className={`day-tag ${getTagClass(day)}`} style={{ display: 'inline-block', marginBottom: 8 }}>{getDisplayName(day)}</span>
        <div className="page-title" style={{ marginTop: 8 }}>{formatDate(day.date)}</div>
      </div>
      {day.type === 'offday' ? (
        <div className="offday-detail">
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🛌</div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Rest & Recovery</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-4)' }}>You took a planned rest day. Your streak was protected.</div>
        </div>
      ) : null}
      <div className="detail-grid">
        {Object.entries(day.data).map(([exercise, ex]) => {
          if (isTreadmill(exercise)) {
            const hasData = ex.speed !== '' || ex.incline !== '' || ex.duration !== '';
            return (
              <div key={exercise} className="detail-card">
                <div className="ex-name" style={{ marginBottom: 10 }}>{exercise}</div>
                <div className="detail-set-row" style={{ opacity: hasData ? 1 : 0.25 }}>
                  <span className="detail-set-val">{hasData ? `${ex.speed || '—'} km/h · ${ex.incline || '—'}% · ${ex.duration || '—'} min` : 'Not logged'}</span>
                </div>
              </div>
            );
          }
          if (isJumpRope(exercise)) {
            const hasData = ex.jumps !== '';
            return (
              <div key={exercise} className="detail-card">
                <div className="ex-name" style={{ marginBottom: 10 }}>{exercise}</div>
                <div className="detail-set-row" style={{ opacity: hasData ? 1 : 0.25 }}>
                  <span className="detail-set-val">{hasData ? `${ex.jumps} jumps` : 'Not logged'}</span>
                </div>
              </div>
            );
          }
          if (!ex.sets) return null;
          return (
            <div key={exercise} className="detail-card">
              <div className="ex-name" style={{ marginBottom: 10 }}>{exercise}</div>
              {ex.sets.map((s, i) => {
                const hasData = s.weight !== '' || s.reps !== '';
                return (
                  <div key={i} className="detail-set-row" style={{ opacity: hasData ? 1 : 0.25 }}>
                    <span className="detail-set-label">Set {i + 1}</span>
                    <span className="detail-set-val">{hasData ? `${s.weight || '—'} kg × ${s.reps || '—'} reps` : 'Not logged'}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}
