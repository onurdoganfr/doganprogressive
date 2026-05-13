import { useState } from 'react';
import { isSameDay } from '../utils/date.js';
import { getLatestForExercise, getOrderedExercises, getDisplayName } from '../utils/workout.js';
import { EX_GROUP_MAP, GROUP_ORDER } from '../data/exerciseLibrary.js';
import ExerciseChart from './ExerciseChart.jsx';

function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getGreeting(hour) {
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 22) return 'Good evening';
  return 'Welcome back';
}

export default function Dashboard({ history, programs, theme, onToggleTheme, user, onAdd }) {
  const [chartEx,    setChartEx]    = useState(null);
  const [openGroups, setOpenGroups] = useState(() => new Set(GROUP_ORDER.concat(['Other'])));

  function toggleGroup(g) {
    setOpenGroups(prev => {
      const next = new Set(prev);
      next.has(g) ? next.delete(g) : next.add(g);
      return next;
    });
  }

  const last  = history.length > 0 ? history[history.length - 1] : null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const now   = new Date();

  // Greeting
  const rawName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
  const firstName = rawName.split(' ')[0];
  const greeting  = getGreeting(now.getHours());

  // Eyebrow
  const weekNum = getISOWeek(today);
  const eyebrow = today.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
    + ' · ' + today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();

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

  // Weekly rhythm (last 7 days)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - 6 + i); return d;
  });
  const weekVol = weekDays.map(d => {
    const ms = d.getTime();
    const count = history.filter(h => {
      const hd = new Date(h.date); hd.setHours(0,0,0,0); return hd.getTime() === ms;
    }).reduce((sum, s) => sum + Object.entries(s.data).filter(([n, ex]) =>
      n !== '__order' && ex.sets?.some(set => set.weight !== '' || set.reps !== '')
    ).length, 0);
    return { d, count };
  });
  const maxVol = Math.max(...weekVol.map(x => x.count), 1);

  // Most trained exercises
  const exCounts = {};
  history.forEach(s => Object.entries(s.data).forEach(([n, ex]) => {
    if (n !== '__order' && ex.sets?.some(set => set.weight !== '' || set.reps !== ''))
      exCounts[n] = (exCounts[n] || 0) + 1;
  }));
  const topEx = Object.entries(exCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCount = topEx[0]?.[1] || 1;

  // Personal bests
  const allLogged = new Set();
  history.forEach(d => Object.keys(d.data).forEach(e => { if (e !== '__order') allLogged.add(e); }));
  const bests = [...allLogged]
    .map(ex => ({ ex, latest: getLatestForExercise(history, ex) }))
    .filter(({ latest }) => latest?.weight)
    .sort((a, b) => parseFloat(b.latest.weight) - parseFloat(a.latest.weight));

  // Top 4 PR cards
  const topPRs = bests.slice(0, 4);

  // Heatmap: last 12 weeks = 84 days
  const heatDays = Array.from({ length: 84 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - 83 + i); return d;
  });
  const heatStart = heatDays[0];
  const heatEnd   = heatDays[heatDays.length - 1];

  return (
    <>
      {/* Hero */}
      <div className="dash-hero">
        <div className="dash-hero-left">
          <div className="dash-eyebrow">{eyebrow}</div>
          <h1 className="dash-greeting">
            {greeting}{firstName ? `, ${firstName}` : ''}.
          </h1>
          <div className="dash-sub">
            {last ? (
              <>
                Last session{' '}
                <span className="dash-sub-num">
                  {Math.round((today - new Date(last.date).setHours(0,0,0,0)) / 86400000) === 0
                    ? 'today'
                    : Math.round((today - new Date(last.date).setHours(0,0,0,0)) / 86400000) === 1
                    ? 'yesterday'
                    : `${Math.round((today - new Date(last.date).setHours(0,0,0,0)) / 86400000)}d ago`}
                </span>
                {' · '}
                <span className="dash-sub-num">{totalWorkouts}</span> sessions total
              </>
            ) : (
              'No workouts logged yet — let\'s get started.'
            )}
          </div>
        </div>
        <div className="dash-hero-right">
          <button
            className="page-theme-btn"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
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
          {onAdd && (
            <button className="dash-cta-btn" onClick={onAdd}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Log Session
            </button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-val">{totalWorkouts}</div>
          <div className="stat-label">Total Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{thisWeek}</div>
          <div className="stat-label">This Week</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{currentStreak}<span className="stat-val-suffix">d</span></div>
          <div className="stat-label">Current Streak</div>
        </div>
        <div className="stat-card stat-card--accent">
          <div className="stat-val stat-val--accent">{longestStreak}<span className="stat-val-suffix stat-val-suffix--accent">d</span></div>
          <div className="stat-label stat-label--accent">Best Streak</div>
        </div>
      </div>

      {!last ? (
        <div className="empty-state">
          <div className="icon">🏋️</div>No workouts logged yet.
          <p>Tap "+ Add Workout" to record your first session.</p>
        </div>
      ) : (
        <>
          {/* Body grid: Rhythm + Leaderboard */}
          <div className="dash-body-grid">
            {/* Left col */}
            <div className="dash-left-col">
              {/* Weekly Rhythm */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <div>
                    <div className="dash-card-eyebrow">Last 7 Days</div>
                    <div className="dash-card-title">Weekly Rhythm</div>
                  </div>
                  <div className="dash-card-pill">{thisWeek} sessions</div>
                </div>
                <div className="rhythm-chart">
                  {weekVol.map(({ d, count }) => {
                    const isToday = isSameDay(d, today);
                    const pct = count === 0 ? 4 : Math.max(8, (count / maxVol) * 100);
                    return (
                      <div key={d.getTime()} className="rhythm-bar-col">
                        <div className="rhythm-num">{count > 0 ? count : ''}</div>
                        <div className="rhythm-bar-track">
                          <div
                            className={`rhythm-bar${count > 0 ? ' has-data' : ''}${isToday ? ' is-today' : ''}`}
                            style={{ height: `${pct}%` }}
                          />
                        </div>
                        <div className={`rhythm-day${isToday ? ' is-today' : ''}`}>
                          {d.toLocaleDateString('en-US', { weekday: 'narrow' })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Last Session */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <div>
                    <div className="dash-card-eyebrow">
                      {new Date(last.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="dash-card-title">{getDisplayName(last)}</div>
                  </div>
                  {last.tag_class && (
                    <span className={`session-tag ${last.tag_class}`}>{last.type || last.program_name}</span>
                  )}
                </div>
                <div className="last-sess-ex-grid">
                  {getOrderedExercises(last.data).slice(0, 6).map(([name, ex]) => {
                    const validSets = ex.sets?.filter(s => s.reps !== '' && s.reps != null) || [];
                    const bestWeighted = validSets
                      .filter(s => parseFloat(s.weight) > 0)
                      .reduce((best, s) => parseFloat(s.weight) > parseFloat(best?.weight || 0) ? s : best, null);
                    const maxReps = validSets.length > 0
                      ? Math.max(...validSets.map(s => parseInt(s.reps) || 0))
                      : 0;
                    const val = !ex.sets
                      ? (ex.speed ? `${ex.speed}km/h` : ex.jumps ? `${ex.jumps} jumps` : '—')
                      : bestWeighted
                      ? `${bestWeighted.weight}kg × ${bestWeighted.reps}`
                      : validSets.length > 0
                      ? `${validSets.length} × ${maxReps} reps`
                      : '—';
                    return (
                      <div key={name} className="last-sess-ex-item" onClick={() => setChartEx(name)}>
                        <div className="last-sess-ex-name">{name}</div>
                        <div className="last-sess-ex-val">{val}</div>
                      </div>
                    );
                  })}
                </div>
                {getOrderedExercises(last.data).length > 6 && (
                  <div className="dash-empty-hint">+{getOrderedExercises(last.data).length - 6} more exercises</div>
                )}
              </div>
            </div>

            {/* Right col — Leaderboard */}
            <div className="dash-leaderboard">
              <div className="dash-card-header" style={{ marginBottom: '16px' }}>
                <div>
                  <div className="dash-card-eyebrow">All Time</div>
                  <div className="dash-card-title">Most Trained</div>
                </div>
              </div>
              {topEx.length === 0 ? (
                <div className="dash-empty-hint">No data yet</div>
              ) : (
                <div className="leaderboard-list">
                  {topEx.map(([name, count], i) => (
                    <div key={name} className="leaderboard-row">
                      <div className="leaderboard-rank">#{i + 1}</div>
                      <div className="leaderboard-body">
                        <div className="leaderboard-name-row">
                          <span className="leaderboard-name">{name}</span>
                          <span className="leaderboard-count">{count}×</span>
                        </div>
                        <div className="leaderboard-bar-track">
                          <div className="leaderboard-bar" style={{ width: `${(count / maxCount) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* PR Cards */}
          {topPRs.length > 0 && (
            <>
              <div className="dash-section-header">
                <span className="dash-section-title">Top Records</span>
              </div>
              <div className="pr-cards-row">
                {topPRs.map(({ ex, latest }) => (
                  <div key={ex} className="pr-card" onClick={() => setChartEx(ex)}>
                    <div className="pr-card-eyebrow">Personal Best</div>
                    <div className="pr-card-name">{ex}</div>
                    <div className="pr-card-weight">
                      {latest.weight}
                      <span className="pr-card-unit">kg</span>
                    </div>
                    {latest.reps && (
                      <div className="pr-card-target">× {latest.reps} reps</div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Personal Bests — grouped by muscle */}
          {bests.length > 0 && (() => {
            const grouped = {};
            bests.forEach(b => {
              const g = EX_GROUP_MAP[b.ex] || 'Other';
              (grouped[g] = grouped[g] || []).push(b);
            });
            const orderedGroups = [
              ...GROUP_ORDER.filter(g => grouped[g]),
              ...Object.keys(grouped).filter(g => !GROUP_ORDER.includes(g)),
            ];
            return (
              <>
                <div className="dash-section-header">
                  <span className="dash-section-title">Personal Bests</span>
                </div>
                {orderedGroups.map(group => (
                  <div key={group} className="pb-group">
                    <button className="pb-group-header" onClick={() => toggleGroup(group)}>
                      <span className="pb-group-label">{group}</span>
                      <span className="pb-group-count">{grouped[group].length}</span>
                      <svg className={`pb-group-chevron${openGroups.has(group) ? ' open' : ''}`}
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>
                    {openGroups.has(group) && (
                      <div className="bests-grid pb-group-grid">
                        {grouped[group].map(({ ex, latest }) => (
                          <div key={ex} className="best-card best-card-clickable" onClick={() => setChartEx(ex)}>
                            <div className="best-name">{ex}</div>
                            <div className="best-val">{latest.weight} kg{latest.reps ? ` × ${latest.reps}` : ''}</div>
                            <div className="best-target">↑ Target: {parseFloat(latest.weight) + 5} kg</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </>
            );
          })()}

          {/* Heatmap */}
          <div className="dash-section-header">
            <span className="dash-section-title">Training Heatmap</span>
          </div>
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
