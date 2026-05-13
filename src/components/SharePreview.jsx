import { useState } from 'react';

export default function SharePreview({ program, user, onImport, onClose }) {
  const [imported, setImported] = useState(false);
  const [loading,  setLoading]  = useState(false);

  async function handleImport() {
    setLoading(true);
    await onImport(program);
    setLoading(false);
    setImported(true);
  }

  const tagLabel = program.tagClass === 'push' ? 'Push'
    : program.tagClass === 'pull' ? 'Pull'
    : 'Custom';

  return (
    <div className="chart-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="share-modal">
        <div className="share-modal-header">
          <div className="share-modal-eyebrow">Shared Program</div>
          <button className="chart-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="share-prog-name">{program.name}</div>
        <span className={`day-tag ${program.tagClass || 'custom'}`} style={{ display: 'inline-block', marginBottom: 16 }}>
          {tagLabel}
        </span>

        <div className="share-ex-list">
          {program.exercises.map(ex => (
            <div key={ex} className="share-ex-item">{ex}</div>
          ))}
        </div>
        <div className="share-ex-count">
          {program.exercises.length} exercise{program.exercises.length !== 1 ? 's' : ''}
        </div>

        {imported ? (
          <div className="share-imported-msg">✓ Added to your programs!</div>
        ) : user ? (
          <button className="btn-primary share-import-btn" onClick={handleImport} disabled={loading}>
            {loading ? 'Adding…' : 'Add to My Programs'}
          </button>
        ) : (
          <div className="share-login-msg">
            Sign in to add this program to your account.
          </div>
        )}
      </div>
    </div>
  );
}
