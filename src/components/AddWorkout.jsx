import { useState, useRef } from 'react';
import ExercisePicker from './ExercisePicker.jsx';
import RestTimer from './RestTimer.jsx';
import { isTreadmill, isJumpRope, makeEmptyData, getPrevForExercise, checkPR } from '../utils/workout.js';
import { EXERCISE_LIBRARY, libAllExercises } from '../data/exerciseLibrary.js';

function DumbbellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="20" height="20">
      <rect x="2" y="10" width="3" height="4" rx="1"/><rect x="19" y="10" width="3" height="4" rx="1"/>
      <rect x="5" y="8" width="3" height="8" rx="1.5"/><rect x="16" y="8" width="3" height="8" rx="1.5"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  );
}

function CardioIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="20" height="20">
      <circle cx="12" cy="13" r="8"/><polyline points="12 9 12 13 15 15"/>
      <path d="M5 3l2 2M19 3l-2 2"/>
    </svg>
  );
}

function sortByOrder(programs, order) {
  if (!order.length) return programs;
  return [...programs].sort((a, b) => {
    const ai = order.indexOf(String(a.id));
    const bi = order.indexOf(String(b.id));
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export default function AddWorkout({ history, programs, initialEntry, onSave, onSaveProgram, onDeleteProgram, onUpdateProgram, onCancel }) {
  const initProg = initialEntry ? {
    id:       initialEntry.type || String(initialEntry.id),
    name:     initialEntry.programName || 'Workout',
    tagClass: initialEntry.tagClass || 'custom',
    exercises: Array.isArray(initialEntry.data.__order)
      ? initialEntry.data.__order.filter(k => initialEntry.data[k] !== undefined)
      : Object.keys(initialEntry.data).filter(k => k !== '__order'),
  } : null;

  const [step,        setStep]        = useState(initProg ? 'form' : 'select');
  const [program,     setProgram]     = useState(initProg);
  const [editProg,    setEditProg]    = useState(null);
  const [data,        setData]        = useState(() => initProg ? makeEmptyData(initProg.exercises) : {});
  const [workoutDate, setWorkoutDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  });
  const [showTimer,      setShowTimer]      = useState(false);
  const [timerKey,       setTimerKey]       = useState(0);
  const [sessionExercises, setSessionExercises] = useState(() => initProg ? initProg.exercises : []);
  const [showAddExModal,   setShowAddExModal]   = useState(false);
  const [addExTab,         setAddExTab]         = useState(Object.keys(EXERCISE_LIBRARY)[0]);
  const [customExInput,    setCustomExInput]    = useState('');

  // Drag-to-reorder state
  const [programOrder, setProgramOrder] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gymProgramOrder') || '[]'); } catch { return []; }
  });
  const [dragIdx,  setDragIdx]  = useState(null);
  const [overIdx,  setOverIdx]  = useState(null);
  const dragRef    = useRef({ active: false, fromIdx: null });
  const overIdxRef = useRef(null);
  const displayRef = useRef([]);

  const displayedPrograms = sortByOrder(programs, programOrder);
  displayRef.current = displayedPrograms;

  // ── Drag handlers ───────────────────────────────────────────
  function handleDragHandleDown(e, idx) {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { active: true, fromIdx: idx };
    overIdxRef.current = idx;
    setDragIdx(idx);

    function onMove(ev) {
      if (!dragRef.current.active) return;
      if (ev.cancelable) ev.preventDefault();
      const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
      document.querySelectorAll('[data-prog-idx]').forEach(card => {
        const rect = card.getBoundingClientRect();
        if (clientY >= rect.top && clientY <= rect.bottom) {
          const i = parseInt(card.getAttribute('data-prog-idx'));
          setOverIdx(i);
          overIdxRef.current = i;
        }
      });
    }

    function onEnd() {
      const from = dragRef.current.fromIdx;
      const to   = overIdxRef.current;
      if (from !== null && to !== null && from !== to) {
        const arr = [...displayRef.current];
        const [item] = arr.splice(from, 1);
        arr.splice(to, 0, item);
        const newOrder = arr.map(p => String(p.id));
        localStorage.setItem('gymProgramOrder', JSON.stringify(newOrder));
        setProgramOrder(newOrder);
      }
      dragRef.current = { active: false, fromIdx: null };
      overIdxRef.current = null;
      setDragIdx(null);
      setOverIdx(null);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mouseup',   onEnd);
      document.removeEventListener('touchend',  onEnd);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup',   onEnd);
    document.addEventListener('touchend',  onEnd);
  }

  // ── Workout helpers ─────────────────────────────────────────
  function startProgram(prog) {
    setProgram(prog);
    setData(makeEmptyData(prog.exercises));
    setSessionExercises([...prog.exercises]);
    setStep('form');
  }

  function removeExercise(ex) {
    setSessionExercises(prev => prev.filter(e => e !== ex));
    setData(d => { const nd = { ...d }; delete nd[ex]; return nd; });
  }

  function addExerciseToSession(ex) {
    if (sessionExercises.includes(ex)) { setShowAddExModal(false); return; }
    setSessionExercises(prev => [...prev, ex]);
    setData(d => ({ ...d, ...makeEmptyData([ex]) }));
    setShowAddExModal(false);
  }

  function handleNewProgram({ name, exercises }) {
    const prog = { id: String(Date.now()), name, tagClass: 'custom', exercises: [...exercises] };
    onSaveProgram(prog);
    setStep('select');
  }

  function handleEditProgram({ name, exercises }) {
    onUpdateProgram({ ...editProg, name, exercises });
    setEditProg(null);
    setStep('select');
  }

  function updateSet(ex, setIndex, field, value) {
    setData(d => {
      const sets = [...d[ex].sets];
      sets[setIndex] = { ...sets[setIndex], [field]: value };
      return { ...d, [ex]: { ...d[ex], sets } };
    });
  }

  function addSet(ex) {
    setData(d => ({
      ...d,
      [ex]: { ...d[ex], sets: [...d[ex].sets, { weight: '', reps: '' }] }
    }));
  }

  function fillAll() {
    setData(d => {
      const newData = { ...d };
      program.exercises.forEach(ex => {
        if (isTreadmill(ex) || isJumpRope(ex)) return;
        if (!hasPrevData(ex)) return;
        const filled = d[ex].sets.map((set, i) => {
          const prev = getPrevForExercise(history, ex, i);
          return prev ? { weight: prev.weight, reps: prev.reps } : set;
        });
        newData[ex] = { ...d[ex], sets: filled };
      });
      return newData;
    });
  }

  function removeSet(ex, setIndex) {
    setData(d => ({
      ...d,
      [ex]: { ...d[ex], sets: d[ex].sets.filter((_, i) => i !== setIndex) }
    }));
  }

  function quickFill(ex) {
    setData(d => {
      const filled = d[ex].sets.map((set, i) => {
        const prev = getPrevForExercise(history, ex, i);
        return prev ? { weight: prev.weight, reps: prev.reps } : set;
      });
      return { ...d, [ex]: { ...d[ex], sets: filled } };
    });
  }

  function hasPrevData(ex) {
    return history.some(s => s.data[ex]?.sets?.some(set => set.weight !== '' || set.reps !== ''));
  }

  /* ── Off Day ── */
  if (step === 'offday') return (
    <>
      <div className="add-header">
        <button className="back-btn" style={{ margin: 0 }} onClick={() => setStep('select')}>←</button>
        <div className="add-title">Log Off Day</div>
        <div className="add-header-actions">
          <input type="date" className="date-picker" value={workoutDate} onChange={e => setWorkoutDate(e.target.value)} />
        </div>
      </div>
      <div className="offday-card">
        <div className="offday-icon">🛌</div>
        <div className="offday-title">Rest & Recovery</div>
        <div className="offday-sub">Your streak will be protected. Rest days are part of the plan.</div>
      </div>
      <div className="btn-row">
        <button className="btn-primary" onClick={() => onSave({
          id: Date.now(), date: new Date(workoutDate + 'T12:00:00').toISOString(),
          type: 'offday', programName: 'Off Day', tagClass: 'offday', data: {}
        })}>Save Off Day</button>
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </>
  );

  /* ── Select program ── */
  if (step === 'select') return (
    <>
      <div className="add-header">
        <button className="back-btn" style={{ margin: 0 }} onClick={onCancel}>←</button>
        <div className="add-title">Add Workout</div>
      </div>
      <p style={{ color: 'var(--text-3)', fontSize: '0.875rem', marginBottom: 20 }}>Choose a program — hold <span style={{ color: 'var(--text-4)' }}>⠿</span> to reorder</p>
      <div className="program-grid">
        <button className="program-card-offday" onClick={() => setStep('offday')}>
          <span className="offday-card-label">Off Day</span>
          <span className="offday-card-sub">Log a rest day</span>
        </button>
        {displayedPrograms.map((prog, i) => (
          <div
            key={prog.id}
            className={`program-card${dragIdx === i ? ' prog-dragging' : ''}${overIdx === i && dragIdx !== i ? ' prog-drag-over' : ''}`}
            data-prog-idx={i}
            onClick={() => dragRef.current.active ? null : startProgram(prog)}
          >
            <div className="prog-actions">
              <button
                className="prog-drag-handle"
                title="Hold to reorder"
                onMouseDown={e => handleDragHandleDown(e, i)}
                onTouchStart={e => handleDragHandleDown(e, i)}
                onClick={e => e.stopPropagation()}
              >⠿</button>
              <button className="prog-edit" title="Edit program"
                onClick={e => { e.stopPropagation(); setEditProg(prog); setStep('edit'); }}>✎</button>
              <button className="prog-delete" title="Delete program"
                onClick={e => { e.stopPropagation(); onDeleteProgram(prog.id); }}>×</button>
            </div>
            <div className="program-name">{prog.name}</div>
          </div>
        ))}
        <button className="program-card-new" onClick={() => setStep('create')}>
          <span style={{ fontSize: '1.1rem' }}>+</span> New Program
        </button>
      </div>
    </>
  );

  /* ── Create new program ── */
  if (step === 'create') return (
    <ExercisePicker showNameInput initial={[]} onConfirm={handleNewProgram} onBack={() => setStep('select')} />
  );

  /* ── Edit existing program ── */
  if (step === 'edit') return (
    <ExercisePicker showNameInput initial={editProg.exercises} initialName={editProg.name}
      onConfirm={handleEditProgram} onBack={() => { setEditProg(null); setStep('select'); }} />
  );

  /* ── Workout form ── */
  const exList = sessionExercises;
  const hasAnyPrevData = exList.some(ex => !isTreadmill(ex) && !isJumpRope(ex) && hasPrevData(ex));

  return (
    <div className="aw-form-wrap">
      <div className="add-header">
        <button className="back-btn" style={{ margin: 0 }} onClick={() => setStep('select')}>←</button>
        <div className="add-title">{program.name}</div>
        <div className="add-header-actions">
          {hasAnyPrevData && (
            <button className="fill-all-btn" onClick={fillAll} title="Fill all exercises from last session">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                <path d="M5 21h14"/>
              </svg>
              <span className="fill-all-label">Fill Last Session</span>
            </button>
          )}
          <input type="date" className="date-picker" value={workoutDate} onChange={e => setWorkoutDate(e.target.value)} />
          <button className={`timer-toggle-btn${showTimer ? ' active' : ''}`} onClick={() => setShowTimer(t => !t)} title="Rest Timer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
              <circle cx="12" cy="13" r="8"/><polyline points="12 9 12 13 15 15"/>
              <path d="M5 3l2 2M19 3l-2 2"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="aw-ex-list">
        {exList.map(exercise => {
          const isTM = isTreadmill(exercise);
          const isJR = isJumpRope(exercise);
          const setCount = data[exercise]?.sets?.length || 0;
          return (
            <div key={exercise} className="dd-ex-card">
              {/* Card header */}
              <div className="dd-ex-card-top">
                <div className={`dd-ex-icon-wrap${isTM || isJR ? ' dd-ex-icon-wrap--cardio' : ''}`}>
                  {isTM || isJR ? <CardioIcon /> : <DumbbellIcon />}
                </div>
                <div className="dd-ex-info" style={{ flex: 1 }}>
                  <div className="dd-ex-name">{exercise}</div>
                  <div className="dd-ex-sub">
                    {isTM || isJR ? 'Cardio' : `${setCount} set${setCount !== 1 ? 's' : ''}`}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {!isTM && !isJR && hasPrevData(exercise) && (
                    <button className="quick-fill-btn" onClick={() => quickFill(exercise)}>↓ Last</button>
                  )}
                  <button className="ex-remove-btn" onClick={() => removeExercise(exercise)} title="Remove">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="dd-ex-divider"/>

              {/* Treadmill */}
              {isTM && [
                { label: 'Speed',    field: 'speed',    unit: 'km/h' },
                { label: 'Incline',  field: 'incline',  unit: '%'    },
                { label: 'Duration', field: 'duration', unit: 'min'  },
              ].map(({ label, field, unit }) => (
                <div key={field} className="dd-set-row">
                  <span className="dd-set-label">{label}</span>
                  <div className="dd-set-edit-row">
                    <input
                      className="dd-input dd-input--wide"
                      type="number"
                      value={data[exercise]?.[field] ?? ''}
                      onChange={e => setData(d => ({ ...d, [exercise]: { ...d[exercise], [field]: e.target.value } }))}
                      placeholder="—"
                    />
                    <span className="dd-unit">{unit}</span>
                  </div>
                </div>
              ))}

              {/* Jump rope */}
              {isJR && (
                <div className="dd-set-row">
                  <span className="dd-set-label">Jumps</span>
                  <div className="dd-set-edit-row">
                    <input
                      className="dd-input dd-input--wide"
                      type="number"
                      value={data[exercise]?.jumps ?? ''}
                      onChange={e => setData(d => ({ ...d, [exercise]: { ...d[exercise], jumps: e.target.value } }))}
                      placeholder="—"
                    />
                    <span className="dd-unit">jumps</span>
                  </div>
                </div>
              )}

              {/* Strength sets */}
              {!isTM && !isJR && (
                <>
                  {(data[exercise]?.sets || []).map((set, i) => {
                    const prevSet = getPrevForExercise(history, exercise, i);
                    const pr      = checkPR(set, prevSet);
                    const hasPrev = prevSet && (prevSet.weight !== '' || prevSet.reps !== '');
                    return (
                      <div key={i} className={`aw-set-grid-row${pr ? ' aw-set-row--pr' : ''}`}>
                        {/* Col 1: label + last session info stacked */}
                        <div className="aw-label-col">
                          <span className="dd-set-label">Set {i + 1}</span>
                          {hasPrev && <span className="aw-prev-val">Last: {prevSet.weight || '—'} × {prevSet.reps || '—'}</span>}
                          {pr && <span className="aw-pr-badge">PR!</span>}
                        </div>
                        {/* Col 2: inputs centered */}
                        <div className="dd-set-edit-row">
                          <input
                            className="dd-input"
                            type="number"
                            value={set.weight}
                            onChange={e => updateSet(exercise, i, 'weight', e.target.value)}
                            placeholder="kg"
                          />
                          <span className="dd-unit">kg ×</span>
                          <input
                            className="dd-input"
                            type="number"
                            value={set.reps}
                            onChange={e => updateSet(exercise, i, 'reps', e.target.value)}
                            placeholder="reps"
                          />
                          <span className="dd-unit">reps</span>
                        </div>
                        {/* Col 3: delete button far right */}
                        <div className="aw-del-col">
                          {i >= 2 && (
                            <button className="dd-del-set-btn" onClick={() => removeSet(exercise, i)} title="Remove set">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <button className="dd-add-set-btn" onClick={() => addSet(exercise)}>+ Add Set</button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <button className="add-ex-to-session-btn" onClick={() => setShowAddExModal(true)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add Exercise
      </button>

      <div className="btn-row">
        <button className="btn-primary" onClick={() => onSave({
          id: Date.now(), date: new Date(workoutDate + 'T12:00:00').toISOString(),
          type: program.id, programName: program.name, tagClass: program.tagClass,
          data: { ...data, __order: sessionExercises }
        })}>Save Workout</button>
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
      </div>

      {showTimer && <RestTimer key={timerKey} onClose={() => setShowTimer(false)} />}

      {showAddExModal && (
        <div className="add-ex-overlay" onClick={() => setShowAddExModal(false)}>
          <div className="add-ex-panel" onClick={e => e.stopPropagation()}>
            <div className="add-ex-panel-header">
              <span className="add-ex-panel-title">Add Exercise</span>
              <button className="add-ex-close-btn" onClick={() => setShowAddExModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="add-ex-tabs">
              {Object.keys(EXERCISE_LIBRARY).map(cat => (
                <button
                  key={cat}
                  className={`add-ex-tab${addExTab === cat ? ' active' : ''}`}
                  onClick={() => { setAddExTab(cat); setCustomExInput(''); }}
                >{cat}</button>
              ))}
            </div>
            <div className="add-ex-list">
              {libAllExercises(addExTab).map(ex => {
                const already = sessionExercises.includes(ex);
                return (
                  <button
                    key={ex}
                    className={`add-ex-item${already ? ' add-ex-item--added' : ''}`}
                    onClick={() => !already && addExerciseToSession(ex)}
                    disabled={already}
                  >
                    <span className="add-ex-item-name">{ex}</span>
                    {already
                      ? <span className="add-ex-item-check">✓</span>
                      : <span className="add-ex-item-plus">+</span>
                    }
                  </button>
                );
              })}
            </div>
            <div className="add-ex-custom-row">
              <input
                className="add-ex-custom-input"
                type="text"
                placeholder="Add your exercise…"
                value={customExInput}
                onChange={e => setCustomExInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && customExInput.trim()) {
                    addExerciseToSession(customExInput.trim());
                    setCustomExInput('');
                  }
                }}
              />
              <button
                className="add-ex-custom-btn"
                disabled={!customExInput.trim()}
                onClick={() => {
                  if (customExInput.trim()) {
                    addExerciseToSession(customExInput.trim());
                    setCustomExInput('');
                  }
                }}
              >Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
