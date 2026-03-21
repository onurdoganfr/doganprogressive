import { useState, useRef } from 'react';
import ExercisePicker from './ExercisePicker.jsx';
import Stepper from './Stepper.jsx';
import RestTimer from './RestTimer.jsx';
import { isTreadmill, isJumpRope, makeEmptyData, getPrevForExercise, checkPR } from '../utils/workout.js';

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

export default function AddWorkout({ history, programs, onSave, onSaveProgram, onDeleteProgram, onUpdateProgram, onCancel }) {
  const [step,        setStep]        = useState('select');
  const [program,     setProgram]     = useState(null);
  const [editProg,    setEditProg]    = useState(null);
  const [data,        setData]        = useState({});
  const [workoutDate, setWorkoutDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  });
  const [showTimer,   setShowTimer]   = useState(false);
  const [timerKey,    setTimerKey]    = useState(0);

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
    setStep('form');
  }

  function handleNewProgram({ name, exercises }) {
    const prog = { id: String(Date.now()), name, tagClass: 'custom', exercises: [...exercises] };
    onSaveProgram(prog);
    startProgram(prog);
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
  const exList = program.exercises;
  const hasAnyPrevData = exList.some(ex => !isTreadmill(ex) && !isJumpRope(ex) && hasPrevData(ex));

  return (
    <>
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

      <div className="ex-grid">
        {exList.map(exercise => (
          <div key={exercise} className="ex-card">
            <div className="ex-card-header">
              <div className="ex-name">{exercise}</div>
              {!isTreadmill(exercise) && !isJumpRope(exercise) && hasPrevData(exercise) && (
                <button className="quick-fill-btn" onClick={() => quickFill(exercise)} title="Fill with last session">
                  ↓ Last session
                </button>
              )}
            </div>

            {isTreadmill(exercise) ? (
              <div className="set-row treadmill-row-wrap">
                <div className="treadmill-top">
                  <Stepper value={data[exercise]?.speed   ?? ''} step={0.5} unit="km/h" onChange={v => setData(d => ({ ...d, [exercise]: { ...d[exercise], speed:   v } }))} />
                  <Stepper value={data[exercise]?.incline ?? ''} step={1}   unit="%"    onChange={v => setData(d => ({ ...d, [exercise]: { ...d[exercise], incline: v } }))} />
                </div>
                <div className="treadmill-bottom">
                  <Stepper value={data[exercise]?.duration ?? ''} step={5} unit="min" onChange={v => setData(d => ({ ...d, [exercise]: { ...d[exercise], duration: v } }))} />
                </div>
              </div>
            ) : isJumpRope(exercise) ? (
              <div className="set-row" style={{ justifyContent: 'center' }}>
                <Stepper value={data[exercise]?.jumps ?? ''} step={10} unit="jumps" onChange={v => setData(d => ({ ...d, [exercise]: { ...d[exercise], jumps: v } }))} />
              </div>
            ) : (
              <>
                <div className="warmup-row"><span className="warmup-label">Warm-up set</span></div>
                {(data[exercise]?.sets || []).map((set, i) => {
                  const prevSet = getPrevForExercise(history, exercise, i);
                  const pr      = checkPR(set, prevSet);
                  const hasPrev = prevSet && (prevSet.weight !== '' || prevSet.reps !== '');
                  return (
                    <div key={i} className={`set-row${pr ? ' pr' : ''}`}>
                      <span className="set-label">Set {i + 1}</span>
                      <div className="set-inputs">
                        <Stepper value={set.weight} step={2.5} unit="kg"   onChange={v => updateSet(exercise, i, 'weight', v)} />
                        <Stepper value={set.reps}   step={1}   unit="reps" onChange={v => updateSet(exercise, i, 'reps',   v)} />
                      </div>
                      {hasPrev && <span className="prev-val">Last: {prevSet.weight || '—'} × {prevSet.reps || '—'}</span>}
                      {pr && <div className="badges"><span className="badge pr">🎉 New PR!</span></div>}
                      {data[exercise].sets.length > 1 && (
                        <button className="set-delete-btn" onClick={() => removeSet(exercise, i)} title="Remove set">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                            <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })}
                <button className="add-set-btn" onClick={() => addSet(exercise)}>+ Add Set</button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="btn-row">
        <button className="btn-primary" onClick={() => onSave({
          id: Date.now(), date: new Date(workoutDate + 'T12:00:00').toISOString(),
          type: program.id, programName: program.name, tagClass: program.tagClass, data
        })}>Save Workout</button>
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
      </div>

      {showTimer && <RestTimer key={timerKey} onClose={() => setShowTimer(false)} />}
    </>
  );
}
