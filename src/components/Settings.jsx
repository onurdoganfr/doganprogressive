import { useRef, useState } from 'react';

export default function Settings({ history, programs, measurements, onImport, onSignOut }) {
  const fileRef = useRef();
  const [status, setStatus] = useState(null);
  const [importing, setImporting] = useState(false);

  function handleExport() {
    const data = {
      gymHistory:      history,
      gymPrograms:     programs,
      gymMeasurements: measurements,
      _exportDate:     new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `gymdogan-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatus('exported');
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setStatus(null);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        await onImport(data);
        setStatus('imported');
      } catch {
        setStatus('error');
      }
      setImporting(false);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div>
      <div className="page-title">Settings</div>
      <div className="page-sub">Backup &amp; restore your data</div>

      <div className="settings-cards">
        {/* Export */}
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

        {/* Import */}
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
          <button className="settings-action-btn" onClick={() => fileRef.current.click()} disabled={importing}>
            {importing ? '…' : 'Upload'}
          </button>
          <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>

        {/* Sign Out */}
        <div className="settings-card settings-card-signout">
          <div className="settings-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>
          <div className="settings-card-body">
            <div className="settings-card-title">Sign Out</div>
            <div className="settings-card-desc">Log out of your account. Your data stays safe in the cloud.</div>
          </div>
          <button className="settings-action-btn settings-signout-btn" onClick={onSignOut}>Sign Out</button>
        </div>
      </div>

      {status === 'exported' && <div className="settings-status ok">Backup downloaded successfully.</div>}
      {status === 'imported' && <div className="settings-status ok">Data restored — all records updated.</div>}
      {status === 'error'    && <div className="settings-status err">Invalid file. Please upload a valid backup.</div>}
    </div>
  );
}
