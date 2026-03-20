import { formatDate } from '../utils/date.js';

export default function ExerciseChart({ exercise, history, onClose }) {
  // Collect best weight per session for this exercise
  const points = [];
  history.forEach(session => {
    const ex = session.data[exercise];
    if (!ex?.sets) return;
    let maxW = -Infinity, repsAtMax = null;
    ex.sets.forEach(s => {
      const w = parseFloat(s.weight);
      if (!isNaN(w) && w > maxW) { maxW = w; repsAtMax = s.reps; }
    });
    if (maxW > -Infinity) points.push({ date: new Date(session.date), weight: maxW, reps: repsAtMax });
  });

  const hasData = points.length >= 2;

  // SVG dimensions
  const W = 500, H = 180;
  const PAD = { top: 16, right: 20, bottom: 36, left: 44 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  let pathD = '', dots = [], yLabels = [], xLabels = [];

  if (hasData) {
    const weights = points.map(p => p.weight);
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    const minD = points[0].date.getTime();
    const maxD = points[points.length - 1].date.getTime();
    const rangeW = maxW - minW || 1;
    const rangeD = maxD - minD || 1;

    const cx = d => PAD.left + ((d.getTime() - minD) / rangeD) * plotW;
    const cy = w => PAD.top + plotH - ((w - minW) / rangeW) * plotH;

    // Y grid labels (4 lines)
    for (let i = 0; i <= 3; i++) {
      const w = minW + (rangeW / 3) * i;
      yLabels.push({ y: cy(w), label: `${Math.round(w)}` });
    }

    // X labels (up to 5 evenly spaced)
    const step = Math.max(1, Math.floor(points.length / 4));
    points.forEach((p, i) => {
      if (i === 0 || i === points.length - 1 || i % step === 0)
        xLabels.push({ x: cx(p.date), label: p.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) });
    });

    pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${cx(p.date)},${cy(p.weight)}`).join(' ');

    dots = points.map(p => ({
      cx: cx(p.date), cy: cy(p.weight),
      weight: p.weight, reps: p.reps, date: p.date,
      isPR: p.weight === maxW,
    }));
  }

  const first  = points[0];
  const latest = points[points.length - 1];
  const best   = points.reduce((b, p) => p.weight > b.weight ? p : b, points[0] || { weight: 0 });
  const gain   = hasData ? (latest.weight - first.weight) : 0;

  return (
    <div className="chart-overlay" onClick={onClose}>
      <div className="chart-modal" onClick={e => e.stopPropagation()}>
        <div className="chart-modal-header">
          <div>
            <div className="chart-modal-title">{exercise}</div>
            {hasData && (
              <div className="chart-modal-sub">
                {formatDate(first.date)} → {formatDate(latest.date)}
              </div>
            )}
          </div>
          <button className="chart-close-btn" onClick={onClose}>×</button>
        </div>

        {!hasData ? (
          <div className="chart-no-data">
            {points.length === 1 ? 'Need at least 2 sessions to show a chart.' : 'No weight data logged yet.'}
          </div>
        ) : (
          <>
            <div className="chart-svg-wrap">
              <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
                {/* Grid lines */}
                {yLabels.map(({ y, label }) => (
                  <g key={label}>
                    <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
                      stroke="#1e1e1e" strokeWidth="1" />
                    <text x={PAD.left - 6} y={y + 4} textAnchor="end"
                      fill="#383838" fontSize="10" fontFamily="inherit">{label}</text>
                  </g>
                ))}

                {/* X labels */}
                {xLabels.map(({ x, label }) => (
                  <text key={label} x={x} y={H - 6} textAnchor="middle"
                    fill="#383838" fontSize="9" fontFamily="inherit">{label}</text>
                ))}

                {/* Line */}
                <path d={pathD} fill="none" stroke="#2e5a2e" strokeWidth="2" strokeLinejoin="round" />

                {/* Area fill */}
                <path
                  d={`${pathD} L${dots[dots.length - 1].cx},${PAD.top + plotH} L${dots[0].cx},${PAD.top + plotH} Z`}
                  fill="url(#chartGrad)" opacity="0.25"
                />
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4caf50" />
                    <stop offset="100%" stopColor="#4caf50" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Dots */}
                {dots.map((d, i) => (
                  <g key={i}>
                    <circle cx={d.cx} cy={d.cy} r={d.isPR ? 5 : 3.5}
                      fill={d.isPR ? '#4caf50' : '#2e5a2e'} stroke="#111" strokeWidth="1.5" />
                    {d.isPR && (
                      <text x={d.cx} y={d.cy - 9} textAnchor="middle"
                        fill="#4caf50" fontSize="9" fontFamily="inherit">{d.weight}kg</text>
                    )}
                  </g>
                ))}
              </svg>
            </div>

            {/* Stats row */}
            <div className="chart-stats">
              <div className="chart-stat">
                <div className="chart-stat-val">{first.weight}kg</div>
                <div className="chart-stat-label">First</div>
              </div>
              <div className="chart-stat">
                <div className="chart-stat-val">{best.weight}kg</div>
                <div className="chart-stat-label">Best PR</div>
              </div>
              <div className="chart-stat">
                <div className="chart-stat-val">{latest.weight}kg</div>
                <div className="chart-stat-label">Latest</div>
              </div>
              <div className="chart-stat">
                <div className={`chart-stat-val ${gain >= 0 ? 'gain-pos' : 'gain-neg'}`}>
                  {gain >= 0 ? '+' : ''}{gain}kg
                </div>
                <div className="chart-stat-label">Total Gain</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
