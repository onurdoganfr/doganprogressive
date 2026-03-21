import { useState } from 'react';
import { EXERCISE_LIBRARY, libAllExercises } from '../data/exerciseLibrary.js';

function getCustomExercises() {
  try { return JSON.parse(localStorage.getItem('gymCustomExercises') || '{}'); } catch { return {}; }
}

function saveCustomExercise(category, name) {
  const customs = getCustomExercises();
  if (!customs[category]) customs[category] = [];
  if (!customs[category].includes(name)) customs[category].push(name);
  localStorage.setItem('gymCustomExercises', JSON.stringify(customs));
}

function removeCustomExercise(category, name) {
  const customs = getCustomExercises();
  if (!customs[category]) return;
  customs[category] = customs[category].filter(e => e !== name);
  localStorage.setItem('gymCustomExercises', JSON.stringify(customs));
}

export default function ExercisePicker({ initial, initialName, showNameInput, onConfirm, onBack }) {
  const [active,      setActive]      = useState(Object.keys(EXERCISE_LIBRARY)[0]);
  const [selected,    setSelected]    = useState(initial || []);
  const [progName,    setProgName]    = useState(initialName || '');
  const [customInput, setCustomInput] = useState('');
  const [customs,     setCustoms]     = useState(getCustomExercises);

  function toggle(ex) {
    setSelected(s => s.includes(ex) ? s.filter(e => e !== ex) : [...s, ex]);
  }

  function addCustom() {
    const name = customInput.trim();
    if (!name || selected.includes(name)) { setCustomInput(''); return; }
    // Save to library under current active category
    saveCustomExercise(active, name);
    setCustoms(getCustomExercises());
    setSelected(s => [...s, name]);
    setCustomInput('');
  }

  const parts = Object.keys(EXERCISE_LIBRARY);
  const canConfirm = selected.length > 0 && (!showNameInput || progName.trim());
  const activeExercises = EXERCISE_LIBRARY[active];
  const activeCustoms   = customs[active] || [];

  // All built-in exercises for active tab (to avoid duplicating customs that are already in library)
  const builtInAll = libAllExercises(active);
  const customsForTab = activeCustoms.filter(ex => !builtInAll.includes(ex));

  return (
    <div className="picker-wrap">
      <div className="add-header">
        <button className="back-btn" style={{ margin: 0 }} onClick={onBack}>←</button>
        <div className="add-title">{showNameInput ? (initialName ? 'Edit Program' : 'New Program') : 'Build Your Program'}</div>
      </div>

      {showNameInput && (
        <input className="prog-name-input" placeholder="Program name (e.g. Leg Day A)…"
          value={progName} onChange={e => setProgName(e.target.value)} />
      )}

      <div className="picker-tabs">
        {parts.map(part => {
          const count = selected.filter(e => libAllExercises(part).includes(e) || (customs[part] || []).includes(e)).length;
          return (
            <button key={part} className={`picker-tab${active === part ? ' active' : ''}`} onClick={() => setActive(part)}>
              {part}{count > 0 && <span className="tab-badge">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Built-in exercises */}
      {Array.isArray(activeExercises) ? (
        <div className="picker-grid">
          {activeExercises.map(ex => (
            <button key={ex} className={`picker-ex${selected.includes(ex) ? ' selected' : ''}`} onClick={() => toggle(ex)}>
              <span className="picker-checkbox">{selected.includes(ex) ? '✓' : ''}</span>{ex}
            </button>
          ))}
        </div>
      ) : (
        <div>
          {Object.entries(activeExercises).map(([sectionName, exes]) => (
            <div key={sectionName}>
              <div className="picker-section-label">{sectionName}</div>
              <div className="picker-grid" style={{ marginBottom: 16 }}>
                {exes.map(ex => (
                  <button key={ex} className={`picker-ex${selected.includes(ex) ? ' selected' : ''}`} onClick={() => toggle(ex)}>
                    <span className="picker-checkbox">{selected.includes(ex) ? '✓' : ''}</span>{ex}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom exercises for this category */}
      {customsForTab.length > 0 && (
        <div>
          <div className="picker-section-label">My Exercises</div>
          <div className="picker-grid" style={{ marginBottom: 16 }}>
            {customsForTab.map(ex => (
              <div key={ex} className="picker-ex-custom-wrap">
                <button className={`picker-ex picker-ex-custom${selected.includes(ex) ? ' selected' : ''}`} onClick={() => toggle(ex)}>
                  <span className="picker-checkbox">{selected.includes(ex) ? '✓' : ''}</span>{ex}
                </button>
                <button
                  className="picker-ex-delete-btn"
                  title="Delete exercise"
                  onClick={() => {
                    removeCustomExercise(active, ex);
                    setCustoms(getCustomExercises());
                    setSelected(s => s.filter(e => e !== ex));
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="picker-custom-add">
        <input className="picker-custom-input" placeholder={`Add to ${active}…`}
          value={customInput} onChange={e => setCustomInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addCustom(); }} />
        <button className="picker-custom-btn" onClick={addCustom}>+ Add</button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: '0.68rem', color: '#2e2e2e', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Selected</div>
        <div className="selected-chips">
          {selected.length === 0
            ? <span className="no-chips">No exercises selected yet</span>
            : selected.map(ex => (
                <span key={ex} className="chip">{ex}
                  <button className="chip-remove" onClick={() => toggle(ex)}>×</button>
                </span>
              ))
          }
        </div>
      </div>

      <div className="picker-footer">
        <span className="picker-count"><strong>{selected.length}</strong> exercises selected</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-ghost" onClick={onBack}>Cancel</button>
          <button className="btn-primary" disabled={!canConfirm}
            onClick={() => showNameInput ? onConfirm({ name: progName.trim(), exercises: selected }) : onConfirm(selected)}>
            {showNameInput ? 'Save Program →' : 'Start Workout →'}
          </button>
        </div>
      </div>
    </div>
  );
}
