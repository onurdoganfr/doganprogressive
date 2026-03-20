function adj(val, step, dir) {
  return String(Math.max(0, Math.round(((parseFloat(val) || 0) + dir * step) * 100) / 100));
}

export default function Stepper({ value, onChange, step, unit }) {
  return (
    <div className="stepper-wrap">
      <div className="stepper">
        <button className="step-btn" onMouseDown={e => e.preventDefault()} onClick={() => onChange(adj(value, step, -1))}>−</button>
        <input className="step-val" type="number" value={value} onChange={e => onChange(e.target.value)} />
        <button className="step-btn" onMouseDown={e => e.preventDefault()} onClick={() => onChange(adj(value, step, +1))}>+</button>
      </div>
      <span className="stepper-unit">{unit}</span>
    </div>
  );
}
