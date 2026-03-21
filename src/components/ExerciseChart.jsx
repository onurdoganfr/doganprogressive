import { useState } from 'react';

function formatShortDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function LineChart({ data }) {
  const [tooltip, setTooltip] = useState(null);

  const W = 500, H = 200;
  const PAD = { l: 48, r: 16, t: 16, b: 44 };
  const pw = W - PAD.l - PAD.r;
  const ph = H - PAD.t - PAD.b;

  const weights = data.map(d => d.maxWeight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;

  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round(minW + (range / yTicks) * i)
  );

  const pts = data.map((d, i) => {
    const x = PAD.l + (data.length === 1 ? pw / 2 : (i / (data.length - 1)) * pw);
    const y = PAD.t + ph - ((d.maxWeight - minW) / range) * ph;
    return { x, y, ...d };
  });

  const polyline = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <div className="exercise-chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="exercise-chart-svg" preserveAspectRatio="xMidYMid meet">
        {yTickValues.map((v, i) => {
          const y = PAD.t + ph - ((v - minW) / range) * ph;
          return (
            <g key={i}>
              <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y}
                stroke="var(--border-3)" strokeWidth="0.5" strokeDasharray="3 3" />
              <text x={PAD.l - 6} y={y + 4} textAnchor="end"
                fontSize="10" fill="var(--text-5)">{v}</text>
            </g>
          );
        })}

        {pts.filter((_, i) => i === 0 || i === pts.length - 1 || (pts.length > 4 && i === Math.floor(pts.length / 2))).map((p, i) => (
          <text key={i} x={p.x} y={H - 6} textAnchor="middle"
            fontSize="9" fill="var(--text-5)">{formatShortDate(p.date)}</text>
        ))}

        {pts.length > 1 && (
          <polygon
            points={`${pts[0].x},${PAD.t + ph} ${polyline} ${pts[pts.length - 1].x},${PAD.t + ph}`}
            fill="var(--green)" fillOpacity="0.08" />
        )}

        {pts.length > 1 && (
          <polyline points={polyline} fill="none" stroke="var(--green)" strokeWidth="2" strokeLinejoin="round" />
        )}

        {pts.map((p, i) => (
          <g key={i} style={{ cursor: 'pointer' }}
            onMouseEnter={() => setTooltip(p)}
            onMouseLeave={() => setTooltip(null)}
            onClick={() => setTooltip(t => t === p ? null : p)}>
            <circle cx={p.x} cy={p.y} r="14" fill="transparent" />
            <circle cx={p.x} cy={p.y} r={tooltip === p ? 6 : 4}
              fill="var(--green)" stroke="var(--bg)" strokeWidth="2" />
          </g>
        ))}

        {tooltip && (() => {
          const tx = Math.min(Math.max(tooltip.x, 60), W - 60);
          const ty = tooltip.y > PAD.t + 40 ? tooltip.y - 36 : tooltip.y + 14;
          return (
            <g>
              <rect x={tx - 52} y={ty - 14} width="104" height="26" rx="5"
                fill="var(--surface)" stroke="var(--border-3)" strokeWidth="1" />
              <text x={tx} y={ty + 4} textAnchor="middle" fontSize="11" fill="var(--text-1)" fontWeight="600">
                {tooltip.maxWeight} kg × {tooltip.reps} reps
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

export default function ExerciseChart({ exercise, history, onClose }) {
  const sessions = history
    .filter(h => h.data && h.data[exercise]?.sets?.length > 0)
    .map(h => {
      const sets = h.data[exercise].sets;
      const validSets = sets.filter(s => parseFloat(s.weight) > 0);
      if (validSets.length === 0) return null;
      const maxWeight = Math.max(...validSets.map(s => parseFloat(s.weight)));
      const bestSet   = validSets.find(s => parseFloat(s.weight) === maxWeight);
      return { date: h.date, maxWeight, reps: bestSet?.reps || '—' };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const pr = sessions.length > 0
    ? sessions.reduce((best, s) => s.maxWeight > best.maxWeight ? s : best, sessions[0])
    : null;

  return (
    <div className="chart-overlay" onClick={onClose}>
      <div className="chart-modal" onClick={e => e.stopPropagation()}>
        <div className="chart-modal-header">
          <div>
            <div className="chart-modal-title">{exercise}</div>
            <div className="chart-modal-sub">Weight progression</div>
          </div>
          <button className="chart-modal-close" onClick={onClose}>✕</button>
        </div>

        {pr && (
          <div className="chart-pr-row">
            <div className="chart-pr-card">
              <div className="chart-pr-label">Personal Best</div>
              <div className="chart-pr-val">{pr.maxWeight} kg <span>× {pr.reps}</span></div>
            </div>
            <div className="chart-pr-card">
              <div className="chart-pr-label">Sessions</div>
              <div className="chart-pr-val">{sessions.length}</div>
            </div>
          </div>
        )}

        {sessions.length === 0 ? (
          <div className="chart-empty">No weight data recorded yet for this exercise.</div>
        ) : sessions.length === 1 ? (
          <div className="chart-single">
            <div className="chart-single-val">{sessions[0].maxWeight} kg × {sessions[0].reps} reps</div>
            <div className="chart-single-sub">First session — {formatShortDate(sessions[0].date)}</div>
          </div>
        ) : (
          <LineChart data={sessions} />
        )}

        {sessions.length > 0 && (
          <div className="chart-history">
            {[...sessions].reverse().slice(0, 8).map((s, i) => (
              <div key={i} className="chart-hist-row">
                <span className="chart-hist-date">{formatShortDate(s.date)}</span>
                <span className="chart-hist-val">{s.maxWeight} kg × {s.reps} reps</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
