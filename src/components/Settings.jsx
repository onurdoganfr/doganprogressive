import { useRef, useState } from 'react';

const KEYS = ['gymHistory', 'gymPrograms', 'gymMeasurements'];

export default function Settings({ onImport }) {
  const fileRef = useRef();
  const [status, setStatus] = useState(null);

  function handleExport() {
    const data = { _exportDate: new Date().toISOString() };
    KEYS.forEach(k => {
      const raw = localStorage.getItem(k);
      data[k] = raw ? JSON.parse(raw) : null;
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gymdogan-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatus('exported');
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        KEYS.forEach(k => {
          if (data[k] !== undefined && data[k] !== null) {
            localStorage.setItem(k, JSON.stringify(data[k]));
          }
        });
        setStatus('imported');
        onImport();
      } catch {
        setStatus('error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div>
      <div className="page-title">Settings</div>
      <div className="page-sub">Backup &amp; restore your data</div>

      <div className="settings-cards">
        <div className="settings-card">
          <div className="settings-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
          <div className="settings-card-body">
            <div className="settings-card-title">Export Data</div>
            <div className="settings-card-desc">Download all workouts, programs and measurements as a JSON file. Use this to back up or move data to another device.</div>
          </div>
          <button className="settings-action-btn" onClick={handleExport}>Download</button>
        </div>

        <div className="settings-card">
          <div className="settings-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <div className="settings-card-body">
            <div className="settings-card-title">Import Data</div>
            <div className="settings-card-desc">Upload a previously exported backup file. This will overwrite your current data.</div>
          </div>
          <button className="settings-action-btn" onClick={() => fileRef.current.click()}>Upload</button>
          <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>
      </div>

      {status === 'exported' && (
        <div className="settings-status ok">Backup downloaded successfully.</div>
      )}
      {status === 'imported' && (
        <div className="settings-status ok">Data restored — all records updated.</div>
      )}
      {status === 'error' && (
        <div className="settings-status err">Invalid file. Please upload a valid backup.</div>
      )}
    </div>
  );
}
