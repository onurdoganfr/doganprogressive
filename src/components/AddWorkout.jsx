import { useState } from 'react';
import ExercisePicker from './ExercisePicker.jsx';
import Stepper from './Stepper.jsx';
import RestTimer from './RestTimer.jsx';
import { isTreadmill, isJumpRope, makeEmptyData, getPrevForExercise, checkPR } from '../utils/workout.js';

export default function AddWorkout({ history, programs, onSave, onSaveProgram, onDeleteProgram, onUpdateProgram, onCancel }) {
  const [step,        setStep]        = useState('select');
  const [program,     setProgram]     = useState(null);
  const [editProg,    setEditProg]    = useState(null);
  const [data,        setData]        = useState({});
  const [workoutDate, setWorkoutDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [showTimer,   setShowTimer]   = useState(false);

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
        <input type="date" className="date-picker" value={workoutDate} onChange={e => setWorkoutDate(e.target.value)} />
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
      <p style={{ color: '#444', fontSize: '0.875rem', marginBottom: 20 }}>Choose a program</p>
      <div className="program-grid">
        <button className="program-card-offday" onClick={() => setStep('offday')}>
          <span className="offday-card-label">Off Day</span>
          <span className="offday-card-sub">Log a rest day</span>
        </button>
        {programs.map(prog => (
          <div key={prog.id} className="program-card" onClick={() => startProgram(prog)}>
            <div className="prog-actions">
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
  return (
    <>
      <div className="add-header">
        <button className="back-btn" style={{ margin: 0 }} onClick={() => setStep('select')}>←</button>
        <div className="add-title">Add Workout</div>
        <span className={`day-tag ${program.tagClass}`}>{program.name}</span>
        <input type="date" className="date-picker" value={workoutDate} onChange={e => setWorkoutDate(e.target.value)} />
        <button className={`timer-toggle-btn${showTimer ? ' active' : ''}`} onClick={() => setShowTimer(t => !t)} title="Rest Timer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
            <circle cx="12" cy="13" r="8"/><polyline points="12 9 12 13 15 15"/>
            <path d="M5 3l2 2M19 3l-2 2"/>
          </svg>
          Rest Timer
        </button>
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

      {showTimer && <RestTimer onClose={() => setShowTimer(false)} />}
    </>
  );
}
