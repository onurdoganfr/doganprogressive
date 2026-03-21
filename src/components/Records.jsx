import { useState } from 'react';
import { EXERCISE_LIBRARY, libAllExercises } from '../data/exerciseLibrary.js';
import ExerciseChart from './ExerciseChart.jsx';

function getCategory(name) {
  for (const [cat, val] of Object.entries(EXERCISE_LIBRARY)) {
    const exes = Array.isArray(val) ? val : Object.values(val).flat();
    if (exes.includes(name)) return cat;
  }
  try {
    const customs = JSON.parse(localStorage.getItem('gymCustomExercises') || '{}');
    for (const [cat, exes] of Object.entries(customs)) {
      if (exes.includes(name)) return cat;
    }
  } catch {}
  return 'Other';
}

function formatShortDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function estimate1RM(weight, reps) {
  if (!weight || !reps || reps <= 0) return null;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 2) / 2; // Epley formula, rounded to 0.5 kg
}

export default function Records({ history }) {
  const [chartEx, setChartEx] = useState(null);

  // Build PR map: exercise → { maxWeight, reps, date, count }
  const prMap = {};
  history.forEach(entry => {
    if (!entry.data || entry.type === 'offday') return;
    Object.entries(entry.data).forEach(([ex, val]) => {
      if (!val?.sets?.length) return;
      val.sets.forEach(s => {
        const w = parseFloat(s.weight);
        const r = parseInt(s.reps);
        if (!w || w <= 0) return;
        if (!prMap[ex]) prMap[ex] = { maxWeight: 0, reps: 0, date: entry.date, count: 0 };
        prMap[ex].count++;
        if (w > prMap[ex].maxWeight || (w === prMap[ex].maxWeight && r > prMap[ex].reps)) {
          prMap[ex].maxWeight = w;
          prMap[ex].reps      = r || 0;
          prMap[ex].date      = entry.date;
        }
      });
    });
  });

  // Group by category
  const grouped = {};
  Object.entries(prMap).forEach(([ex, data]) => {
    const cat = getCategory(ex);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push({ name: ex, ...data });
  });

  // Sort each category by maxWeight desc
  Object.values(grouped).forEach(arr =>
    arr.sort((a, b) => b.maxWeight - a.maxWeight)
  );

  const categories = Object.keys(grouped).sort();
  const totalPRs   = Object.keys(prMap).length;

  return (
    <>
      <div className="page-title">Personal Records</div>
      <div className="page-sub">Your best performance per exercise</div>

      {totalPRs === 0 ? (
        <div className="empty-state">
          <div className="icon">🏆</div>
          No records yet.
          <p>Start logging workouts to see your personal bests here.</p>
        </div>
      ) : (
        <>
          <div className="records-summary">
            <div className="records-stat">{totalPRs} <span>exercises tracked</span></div>
          </div>

          {categories.map(cat => (
            <div key={cat} className="records-group">
              <div className="records-group-title">{cat}</div>
              {grouped[cat].map(ex => (
                <button key={ex.name} className="records-row" onClick={() => setChartEx(ex.name)}>
                  <div className="records-row-left">
                    <div className="records-ex-name">{ex.name}</div>
                    <div className="records-ex-date">{formatShortDate(ex.date)}</div>
                  </div>
                  <div className="records-row-right">
                    <div className="records-weight">{ex.maxWeight} <span>kg</span></div>
                    {ex.reps > 0 && <div className="records-reps">× {ex.reps} reps</div>}
                    {ex.reps > 1 && estimate1RM(ex.maxWeight, ex.reps) && (
                      <div className="records-1rm">~{estimate1RM(ex.maxWeight, ex.reps)} kg 1RM</div>
                    )}
                    <svg className="records-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </>
      )}

      {chartEx && (
        <ExerciseChart exercise={chartEx} history={history} onClose={() => setChartEx(null)} />
      )}
    </>
  );
}
