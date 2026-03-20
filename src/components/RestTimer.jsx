import { useState, useEffect, useRef } from 'react';

const PRESETS = [60, 90, 120, 180];

export default function RestTimer({ onClose }) {
  const [total,   setTotal]   = useState(90);
  const [seconds, setSeconds] = useState(90);
  const [running, setRunning] = useState(true);
  const [done,    setDone]    = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running && !done) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) { setDone(true); setRunning(false); return 0; }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, done]);

  function reset(secs) {
    clearInterval(intervalRef.current);
    setTotal(secs);
    setSeconds(secs);
    setRunning(true);
    setDone(false);
  }

  function togglePause() {
    if (done) { reset(total); return; }
    setRunning(r => !r);
  }

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = seconds / total;
  const circumference = 2 * Math.PI * 28;
  const dash = circumference * progress;

  return (
    <div className={`rest-timer-float${done ? ' rest-done' : ''}`}>
      <div className="rest-timer-ring">
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="28" fill="none" stroke="#1e1e1e" strokeWidth="4" />
          <circle cx="36" cy="36" r="28" fill="none"
            stroke={done ? '#4caf50' : '#3d6b3d'}
            strokeWidth="4"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            transform="rotate(-90 36 36)"
            style={{ transition: 'stroke-dasharray 0.9s linear' }}
          />
          <text x="36" y="41" textAnchor="middle" fill={done ? '#4caf50' : '#eee'}
            fontSize="13" fontWeight="700" fontFamily="inherit">
            {done ? 'GO!' : `${mins}:${String(secs).padStart(2, '0')}`}
          </text>
        </svg>
      </div>

      <div className="rest-timer-controls">
        <div className="rest-timer-label">{done ? 'Rest complete' : 'Rest timer'}</div>
        <div className="rest-timer-presets">
          {PRESETS.map(s => (
            <button key={s} className={`rest-preset-btn${total === s ? ' active' : ''}`}
              onClick={() => reset(s)}>
              {s}s
            </button>
          ))}
        </div>
        <div className="rest-timer-actions">
          <button className="rest-action-btn" onClick={togglePause}>
            {done ? '↺ Restart' : running ? '⏸ Pause' : '▶ Resume'}
          </button>
        </div>
      </div>

      <button className="rest-timer-close" onClick={onClose}>×</button>
    </div>
  );
}
