import { useState } from 'react';
import { formatDate } from '../utils/date.js';
import { isTreadmill, isJumpRope, getDisplayName, getTagClass, getOrderedExercises } from '../utils/workout.js';

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

export default function DayDetail({ day, onBack, onUpdate, onRepeat }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData,  setEditData]  = useState(() => JSON.parse(JSON.stringify(day.data)));

  const displayData   = isEditing ? editData : day.data;
  const exerciseCount = getOrderedExercises(day.data).filter(([, v]) => v.sets || v.speed !== undefined || v.jumps !== undefined).length;

  function startEdit()  { setEditData(JSON.parse(JSON.stringify(day.data))); setIsEditing(true); }
  function cancelEdit() { setEditData(JSON.parse(JSON.stringify(day.data))); setIsEditing(false); }

  function handleSave() {
    onUpdate?.({ ...day, data: editData });
    setIsEditing(false);
  }

  function updateSetField(ex, i, field, val) {
    setEditData(d => {
      const sets = [...d[ex].sets];
      sets[i] = { ...sets[i], [field]: val };
      return { ...d, [ex]: { ...d[ex], sets } };
    });
  }

  function addSet(ex) {
    setEditData(d => ({
      ...d,
      [ex]: { ...d[ex], sets: [...d[ex].sets, { weight: '', reps: '' }] },
    }));
  }

  function removeSet(ex, i) {
    setEditData(d => ({
      ...d,
      [ex]: { ...d[ex], sets: d[ex].sets.filter((_, idx) => idx !== i) },
    }));
  }

  function updateCardioField(ex, field, val) {
    setEditData(d => ({ ...d, [ex]: { ...d[ex], [field]: val } }));
  }

  return (
    <div className="dd-page">

      {/* ── Header ── */}
      <div className="dd-header">
        <button className="dd-back-btn" onClick={isEditing ? cancelEdit : onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        {isEditing ? (
          <>
            <button className="dd-cancel-btn" onClick={cancelEdit}>Cancel</button>
            <span className="dd-header-title">Edit Workout</span>
            <button className="dd-save-btn" onClick={handleSave}>Save</button>
          </>
        ) : (
          <>
            <button className="dd-edit-pill" onClick={startEdit}>Edit</button>
            <span className="dd-header-title">Workout Details</span>
            <div className="dd-header-right" />
          </>
        )}
      </div>

      {/* ── Summary card ── */}
      <div className="dd-summary-card">
        <div className="dd-summary-top">
          <span className={`day-tag ${getTagClass(day)}`}>{getDisplayName(day)}</span>
        </div>
        <div className="dd-summary-label">Workout Summary</div>
        <div className="dd-summary-meta">
          <div className="dd-meta-col">
            <div className="dd-meta-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13" style={{marginRight:4}}>
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Date
            </div>
            <div className="dd-meta-val">{formatDate(day.date)}</div>
          </div>
          <div className="dd-meta-divider"/>
          <div className="dd-meta-col">
            <div className="dd-meta-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13" style={{marginRight:4}}>
                <rect x="2" y="10" width="3" height="4" rx="1"/><rect x="19" y="10" width="3" height="4" rx="1"/>
                <rect x="5" y="8" width="3" height="8" rx="1.5"/><rect x="16" y="8" width="3" height="8" rx="1.5"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              Exercises
            </div>
            <div className="dd-meta-val">{exerciseCount}</div>
          </div>
        </div>
      </div>

      {/* ── Off day ── */}
      {day.type === 'offday' && (
        <div className="offday-detail">
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🛌</div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Rest & Recovery</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-4)' }}>You took a planned rest day. Your streak was protected.</div>
        </div>
      )}

      {/* ── Repeat button ── */}
      {day.type !== 'offday' && !isEditing && onRepeat && (
        <button className="dd-repeat-btn" onClick={() => onRepeat(day)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
            <polyline points="17 1 21 5 17 9"/>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
            <polyline points="7 23 3 19 7 15"/>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
          </svg>
          Repeat This Workout
        </button>
      )}

      {/* ── Exercises section ── */}
      {day.type !== 'offday' && (
        <>
          <div className="dd-section-header">
            <span className="dd-section-title">Exercises</span>
            <span className="dd-section-count">{exerciseCount} exercises</span>
          </div>

          <div className="dd-ex-list">
            {getOrderedExercises(displayData).map(([exercise, ex]) => {
              const isTM = isTreadmill(exercise);
              const isJR = isJumpRope(exercise);
              const setCount = ex.sets?.length || 0;

              return (
                <div key={exercise} className="dd-ex-card">
                  {/* Exercise card header */}
                  <div className="dd-ex-card-top">
                    <div className={`dd-ex-icon-wrap${isTM || isJR ? ' dd-ex-icon-wrap--cardio' : ''}`}>
                      {isTM || isJR ? <CardioIcon /> : <DumbbellIcon />}
                    </div>
                    <div className="dd-ex-info">
                      <div className="dd-ex-name">{exercise}</div>
                      <div className="dd-ex-sub">
                        {isTM || isJR ? 'Cardio' : `${setCount} set${setCount !== 1 ? 's' : ''}`}
                      </div>
                    </div>
                  </div>

                  <div className="dd-ex-divider"/>

                  {/* Treadmill — one row per field */}
                  {isTM && [
                    { label: 'Speed',    field: 'speed',    unit: 'km/h' },
                    { label: 'Incline',  field: 'incline',  unit: '%'    },
                    { label: 'Duration', field: 'duration', unit: 'min'  },
                  ].map(({ label, field, unit }) => (
                    <div key={field} className="dd-set-row">
                      <span className="dd-set-label">{label}</span>
                      {isEditing ? (
                        <div className="dd-set-edit-row">
                          <input className="dd-input dd-input--wide" type="number"
                            value={ex[field] ?? ''}
                            onChange={e => updateCardioField(exercise, field, e.target.value)}
                            placeholder="—"/>
                          <span className="dd-unit">{unit}</span>
                        </div>
                      ) : (
                        <span className="dd-set-val">
                          <strong>{ex[field] || '—'}</strong> <span className="dd-unit">{unit}</span>
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Jump rope */}
                  {isJR && (
                    <div className="dd-set-row">
                      <span className="dd-set-label">Jumps</span>
                      {isEditing ? (
                        <div className="dd-set-edit-row">
                          <input className="dd-input dd-input--wide" type="number" value={ex.jumps ?? ''} onChange={e => updateCardioField(exercise, 'jumps', e.target.value)} placeholder="—"/>
                          <span className="dd-unit">jumps</span>
                        </div>
                      ) : (
                        <span className="dd-set-val"><strong>{ex.jumps || '—'}</strong> <span className="dd-unit">jumps</span></span>
                      )}
                    </div>
                  )}

                  {/* Strength sets */}
                  {ex.sets && ex.sets.map((s, i) => {
                    const hasData = s.weight !== '' || s.reps !== '';
                    return (
                      <div key={i} className={`dd-set-row${!hasData && !isEditing ? ' dd-set-row--empty' : ''}`}>
                        <span className="dd-set-label">Set {i + 1}</span>
                        {isEditing ? (
                          <div className="dd-set-edit-row">
                            <input
                              className="dd-input"
                              type="number"
                              value={s.weight}
                              onChange={e => updateSetField(exercise, i, 'weight', e.target.value)}
                              placeholder="kg"
                            />
                            <span className="dd-unit">kg ×</span>
                            <input
                              className="dd-input"
                              type="number"
                              value={s.reps}
                              onChange={e => updateSetField(exercise, i, 'reps', e.target.value)}
                              placeholder="reps"
                            />
                            <span className="dd-unit">reps</span>
                            {ex.sets.length > 1 && (
                              <button className="dd-del-set-btn" onClick={() => removeSet(exercise, i)} title="Remove set">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="dd-set-val">
                            {hasData ? (
                              <>
                                {s.weight !== '' && <><strong>{s.weight}</strong> <span className="dd-unit">kg</span> <span className="dd-x">×</span> </>}
                                {s.reps   !== '' && <><strong>{s.reps}</strong>   <span className="dd-unit">reps</span></>}
                              </>
                            ) : (
                              <span className="dd-not-logged">Not logged</span>
                            )}
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {isEditing && ex.sets && (
                    <button className="dd-add-set-btn" onClick={() => addSet(exercise)}>
                      + Add Set
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
