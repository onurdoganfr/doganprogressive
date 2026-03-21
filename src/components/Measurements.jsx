import { useState } from 'react';
import { formatDate } from '../utils/date.js';

const FIELDS = [
  { key: 'weight',    label: 'Weight',    unit: 'kg' },
  { key: 'rightArm',  label: 'Right Arm', unit: 'cm' },
  { key: 'leftArm',   label: 'Left Arm',  unit: 'cm' },
  { key: 'shoulders', label: 'Shoulders', unit: 'cm' },
  { key: 'chest',     label: 'Chest',     unit: 'cm' },
  { key: 'waist',     label: 'Waist',     unit: 'cm' },
  { key: 'hips',      label: 'Hips',      unit: 'cm' },
  { key: 'rightLeg',  label: 'Right Leg', unit: 'cm' },
  { key: 'leftLeg',   label: 'Left Leg',  unit: 'cm' },
];

export default function Measurements({ measurements, onSave, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [form, setForm] = useState({});

  const sorted = [...measurements].sort((a, b) => new Date(a.date) - new Date(b.date));
  const latest = sorted.length > 0 ? sorted[sorted.length - 1] : null;
  const prev   = sorted.length > 1 ? sorted[sorted.length - 2] : null;

  function handleSave() {
    const hasAny = FIELDS.some(f => form[f.key] !== '' && form[f.key] != null);
    if (!hasAny) return;
    onSave({ id: Date.now(), date: new Date(date + 'T12:00:00').toISOString(), values: form });
    setShowForm(false);
    setForm({});
    setDate(new Date().toISOString().split('T')[0]);
  }

  function diff(key) {
    if (!latest || !prev) return null;
    const a = parseFloat(latest.values[key]);
    const b = parseFloat(prev.values[key]);
    if (isNaN(a) || isNaN(b)) return null;
    return (a - b).toFixed(1);
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Body Measurements</div>
        <div className="page-sub">Track your body composition over time</div>
      </div>

      <button className="meas-add-btn" onClick={() => setShowForm(s => !s)}>
        {showForm ? '✕ Cancel' : '+ Record Measurements'}
      </button>

      {showForm && (
        <div className="meas-form-card">
          <div className="meas-form-header">
            <span className="meas-form-title">New Entry</span>
            <input type="date" className="date-picker" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="meas-input-grid">
            {FIELDS.map(f => (
              <div key={f.key} className={`meas-field${f.key === 'weight' ? ' meas-field-weight' : ''}`}>
                <label className="meas-label">{f.label}</label>
                <div className="meas-input-wrap">
                  <input
                    type="number" step="0.1" min="0"
                    className="meas-input"
                    placeholder="—"
                    value={form[f.key] || ''}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  />
                  <span className="meas-unit">{f.unit}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="btn-row" style={{ marginTop: 16 }}>
            <button className="btn-primary" onClick={handleSave}>Save Entry</button>
            <button className="btn-ghost" onClick={() => { setShowForm(false); setForm({}); }}>Cancel</button>
          </div>
        </div>
      )}

      {latest && (
        <>
          <div className="meas-hist-top" style={{ marginBottom: 8 }}>
            <div className="section-head" style={{ margin: 0 }}>Latest — {formatDate(latest.date)}</div>
            <button className="meas-hist-delete" onClick={() => onDelete(latest.id)} title="Delete entry">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            </button>
          </div>
          <div className="meas-latest-grid">
            {FIELDS.map(f => {
              const val = latest.values[f.key];
              const d   = diff(f.key);
              const dn  = parseFloat(d);
              return (
                <div key={f.key} className={`meas-latest-card${f.key === 'weight' ? ' meas-card-weight' : ''}`}>
                  <div className="meas-latest-label">{f.label}</div>
                  <div className="meas-latest-val">
                    {val ? `${val}` : '—'}
                    {val ? <span className="meas-latest-unit"> {f.unit}</span> : ''}
                  </div>
                  {d !== null && dn !== 0 && (
                    <div className={`meas-diff ${dn > 0 ? 'pos' : 'neg'}`}>
                      {dn > 0 ? '+' : ''}{d} {f.unit}
                    </div>
                  )}
                  {d !== null && dn === 0 && (
                    <div className="meas-diff">no change</div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {sorted.length > 1 && (
        <>
          <div className="section-head">History</div>
          <div className="meas-history">
            {[...sorted].reverse().slice(1).map(entry => (
              <div key={entry.id} className="meas-hist-row">
                <div className="meas-hist-top">
                  <span className="meas-hist-date">{formatDate(entry.date)}</span>
                  <button className="meas-hist-delete" onClick={() => onDelete(entry.id)} title="Delete entry">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                      <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
                <div className="meas-hist-vals">
                  {FIELDS.filter(f => entry.values[f.key]).map(f => (
                    <span key={f.key} className="meas-hist-item">
                      <span className="meas-hist-key">{f.label}</span> {entry.values[f.key]} {f.unit}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!latest && !showForm && (
        <div className="empty-state">
          <div className="icon">📏</div>
          No measurements recorded yet.
          <p>Tap "Record Measurements" to log your first entry.</p>
        </div>
      )}
    </>
  );
}
