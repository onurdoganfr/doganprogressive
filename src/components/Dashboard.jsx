import { useState } from 'react';
import { isSameDay } from '../utils/date.js';
import { getLatestForExercise } from '../utils/workout.js';
import DayStrip from './DayStrip.jsx';
import LastSessionCard from './LastSessionCard.jsx';
import ExerciseChart from './ExerciseChart.jsx';

export default function Dashboard({ history, programs, theme, onToggleTheme }) {
  const [chartEx, setChartEx] = useState(null);
  const last  = history.length > 0 ? history[history.length - 1] : null;
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const workoutDays = new Set(history.map(h => {
    const d = new Date(h.date); d.setHours(0,0,0,0); return d.getTime();
  }));

  // Stats
  const totalWorkouts = history.length;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const thisWeek = history.filter(h => new Date(h.date) >= weekStart).length;

  function streakFrom(startMs) {
    let s = 0, d = new Date(startMs);
    while (workoutDays.has(d.getTime())) { s++; d.setDate(d.getDate() - 1); }
    return s;
  }
  const todayMs = today.getTime();
  const ystrdMs = todayMs - 86400000;
  const currentStreak = workoutDays.has(todayMs) ? streakFrom(todayMs)
                      : workoutDays.has(ystrdMs)  ? streakFrom(ystrdMs) : 0;

  const sortedMs = [...workoutDays].sort((a, b) => a - b);
  let longestStreak = 0, tmp = 0;
  sortedMs.forEach((ms, i) => {
    tmp = (i > 0 && ms - sortedMs[i - 1] === 86400000) ? tmp + 1 : 1;
    if (tmp > longestStreak) longestStreak = tmp;
  });

  // Weekly volume (last 7 days)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - 6 + i); return d;
  });
  const weekVol = weekDays.map(d => {
    const ms = d.getTime();
    const count = history.filter(h => {
      const hd = new Date(h.date); hd.setHours(0,0,0,0); return hd.getTime() === ms;
    }).reduce((sum, s) => sum + Object.entries(s.data).filter(([, ex]) =>
      ex.sets?.some(set => set.weight !== '' || set.reps !== '')
    ).length, 0);
    return { d, count };
  });
  const maxVol = Math.max(...weekVol.map(x => x.count), 1);

  // Most trained exercises
  const exCounts = {};
  history.forEach(s => Object.entries(s.data).forEach(([n, ex]) => {
    if (ex.sets?.some(set => set.weight !== '' || set.reps !== ''))
      exCounts[n] = (exCounts[n] || 0) + 1;
  }));
  const topEx = Object.entries(exCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCount = topEx[0]?.[1] || 1;

  // Personal bests
  const allLogged = new Set();
  history.forEach(d => Object.keys(d.data).forEach(e => allLogged.add(e)));
  const bests = [...allLogged]
    .map(ex => ({ ex, latest: getLatestForExercise(history, ex) }))
    .filter(({ latest }) => latest?.weight);

  // Heatmap: last 12 weeks = 84 days
  const heatDays = Array.from({ length: 84 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - 83 + i); return d;
  });
  const heatStart = heatDays[0];
  const heatEnd   = heatDays[heatDays.length - 1];

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">Dashboard</div>
            <div className="page-sub">Your training overview</div>
          </div>
          <button className="page-theme-btn" onClick={onToggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        {[
          { label: 'Total Workouts', value: totalWorkouts },
          { label: 'This Week',      value: thisWeek },
          { label: 'Current Streak', value: `${currentStreak}d` },
          { label: 'Longest Streak', value: `${longestStreak}d` },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-val">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <DayStrip history={history} />

      {!last ? (
        <div className="empty-state">
          <div className="icon">🏋️</div>No workouts logged yet.
          <p>Tap "+ Add Workout" to record your first session.</p>
        </div>
      ) : (
        <>
          {/* Weekly Volume + Most Trained */}
          <div className="dash-two-col">
            <div className="dash-card">
              <div className="section-head" style={{ marginTop: 0 }}>Weekly Volume</div>
              <div className="vol-chart">
                {weekVol.map(({ d, count }) => {
                  const isToday = isSameDay(d, today);
                  const pct = count === 0 ? 4 : Math.max(10, (count / maxVol) * 100);
                  return (
                    <div key={d.getTime()} className="vol-bar-wrap">
                      <div className="vol-num">{count > 0 ? count : ''}</div>
                      <div className="vol-bar-track">
                        <div className={`vol-bar${count > 0 ? ' has-data' : ''}${isToday ? ' is-today' : ''}`}
                          style={{ height: `${pct}%` }} />
                      </div>
                      <div className={`vol-day${isToday ? ' is-today' : ''}`}>
                        {d.toLocaleDateString('en-US', { weekday: 'narrow' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="dash-card">
              <div className="section-head" style={{ marginTop: 0 }}>Most Trained</div>
              {topEx.length === 0
                ? <div style={{ color: '#2a2a2a', fontSize: '0.78rem' }}>No data yet</div>
                : topEx.map(([name, count], i) => (
                  <div key={name} className="most-row">
                    <span className="most-rank">#{i + 1}</span>
                    <span className="most-name">{name}</span>
                    <div className="most-bar-wrap">
                      <div className="most-bar" style={{ width: `${(count / maxCount) * 100}%` }} />
                    </div>
                    <span className="most-count">{count}x</span>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Last Session */}
          <div className="section-head">Last Session</div>
          <LastSessionCard session={last} />

          {/* Personal Bests */}
          {bests.length > 0 && (
            <>
              <div className="section-head">Personal Bests</div>
              <div className="bests-grid">
                {bests.map(({ ex, latest }) => (
                  <div key={ex} className="best-card best-card-clickable" onClick={() => setChartEx(ex)}>
                    <div className="best-name">{ex}</div>
                    <div className="best-val">{latest.weight} kg{latest.reps ? ` × ${latest.reps}` : ''}</div>
                    <div className="best-target">↑ Target: {parseFloat(latest.weight) + 5} kg</div>
                    <div className="best-chart-hint">📈 View progress</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Heatmap */}
          <div className="section-head">Training Heatmap</div>
          <div className="heatmap-outer">
            <div className="heatmap-grid">
              {heatDays.map(d => {
                const ms = d.getTime();
                return (
                  <div key={ms}
                    className={`heatmap-cell${workoutDays.has(ms) ? ' active' : ''}${isSameDay(d, today) ? ' today' : ''}`}
                    title={d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                );
              })}
            </div>
            <div className="heatmap-labels">
              <span className="heatmap-label">{heatStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <span className="heatmap-label">{heatEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </>
      )}

      {chartEx && <ExerciseChart exercise={chartEx} history={history} onClose={() => setChartEx(null)} />}
    </>
  );
}
