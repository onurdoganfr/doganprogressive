const TREADMILL_EX = new Set(['Treadmill']);
const JUMP_ROPE_EX = new Set(['Jump Rope']);

export function isTreadmill(ex) { return TREADMILL_EX.has(ex); }
export function isJumpRope(ex)  { return JUMP_ROPE_EX.has(ex); }

export function makeEmptyData(exercises) {
  const d = {};
  exercises.forEach(ex => {
    if (isTreadmill(ex))     d[ex] = { speed: '', incline: '', duration: '' };
    else if (isJumpRope(ex)) d[ex] = { jumps: '' };
    else                     d[ex] = { sets: [{ weight: '', reps: '' }, { weight: '', reps: '' }] };
  });
  return d;
}

// Returns [[exerciseName, value], ...] in the stored order, skipping the __order key
export function getOrderedExercises(data) {
  const order = Array.isArray(data.__order) ? data.__order : null;
  const entries = Object.entries(data).filter(([k]) => k !== '__order');
  if (!order) return entries;
  const map = Object.fromEntries(entries);
  return order.filter(k => map[k] !== undefined).map(k => [k, map[k]]);
}

// Migrate old { w1, w2 } format to { sets: [...] }
export function migrateEntry(entry) {
  const newData = {};
  for (const [ex, val] of Object.entries(entry.data)) {
    if (ex === '__order') { newData.__order = val; continue; }
    if (val.w1 !== undefined) {
      newData[ex] = { sets: [val.w1, val.w2].filter(Boolean) };
    } else {
      newData[ex] = val;
    }
  }
  return { ...entry, data: newData };
}

export function getLatestForExercise(history, exercise) {
  for (let i = history.length - 1; i >= 0; i--) {
    const ex = history[i].data[exercise];
    if (!ex || !ex.sets) continue;
    let maxW = -Infinity, repsAtMax = null;
    ex.sets.forEach(s => {
      const w = parseFloat(s.weight), r = parseInt(s.reps);
      if (!isNaN(w) && w > maxW) { maxW = w; repsAtMax = isNaN(r) ? null : r; }
    });
    if (maxW > -Infinity) return { weight: maxW, reps: repsAtMax, date: history[i].date };
  }
  return null;
}

export function getPrevForExercise(history, exercise, setIndex) {
  for (let i = history.length - 1; i >= 0; i--) {
    const ex = history[i].data[exercise];
    if (!ex || !ex.sets) continue;
    const s = ex.sets[setIndex];
    if (s && (s.weight !== '' || s.reps !== '')) return s;
  }
  return null;
}

export function checkPR(cur, prev) {
  if (!prev) return false;
  const cw = parseFloat(cur.weight), cr = parseInt(cur.reps);
  const pw = parseFloat(prev.weight), pr = parseInt(prev.reps);
  if ((isNaN(cw) || cur.weight === '') && (isNaN(cr) || cur.reps === '')) return false;
  return (!isNaN(cw) && !isNaN(pw) && cw > pw) || (!isNaN(cr) && !isNaN(pr) && cr > pr);
}

export function getDisplayName(day) {
  return day.programName || (day.type === 'push' ? 'Push Day' : day.type === 'pull' ? 'Pull Day' : 'Custom');
}

export function getTagClass(day) {
  return day.tagClass || (day.type === 'push' ? 'push' : day.type === 'pull' ? 'pull' : 'custom');
}
