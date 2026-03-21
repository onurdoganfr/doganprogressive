import { useRef, useState, useMemo } from 'react';

const KVKK_TEXT = `PRIVACY POLICY & DATA PROTECTION NOTICE

Last updated: March 2026

1. DATA CONTROLLER
Your personal data processed within the DOGAN Progressive Overload application ("App") is handled by the application owner, Onur Doğan.

2. PERSONAL DATA COLLECTED
The following data is collected through the App:
• Account information: Name, email address
• Workout data: Exercise history, program details, set/rep/weight records
• Body measurement data: Weight, body measurements

3. PURPOSE OF DATA PROCESSING
Collected data is used solely for the following purposes:
• Providing the core functionality of the App
• Managing your user account
• Tracking workout history and progress
Your data is never shared with third parties or used for advertising purposes.

4. DATA STORAGE
Your data is securely stored on Supabase (supabase.com) infrastructure. Supabase uses industry-standard encryption methods to protect your data.

5. DATA RETENTION
Your data is retained for as long as your account is active. When you delete your account, all your data is permanently and irreversibly deleted.

6. YOUR RIGHTS
You have the following rights regarding your personal data:
• Right to access your data
• Right to request correction of your data
• Right to request deletion of your data (Profile → Delete Account)
• Right to object to data processing

7. CONTACT
For any requests or questions regarding your personal data, you may use the account deletion feature on the Profile page or contact the application owner directly.

8. LIMITATION OF LIABILITY
The App is provided "as is". The application owner cannot be held liable for technical failures, data losses, or issues arising from third-party service providers (Supabase, Netlify).`;


export default function Settings({ history, programs, measurements, onImport, onSignOut }) {
  const fileRef = useRef();
  const [status,      setStatus]    = useState(null);
  const [importing,   setImporting] = useState(false);
  const [showKvkk,    setShowKvkk] = useState(false);
  const [calcWeight,  setCalcWeight] = useState('');
  const [calcReps,    setCalcReps]   = useState('');

  const result1RM = useMemo(() => {
    const w = parseFloat(calcWeight);
    const r = parseInt(calcReps);
    if (!w || !r || r <= 0 || w <= 0) return null;
    if (r === 1) return w;
    return Math.round(w * (1 + r / 30) * 2) / 2;
  }, [calcWeight, calcReps]);

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

        {/* 1RM Calculator */}
        <div className="settings-card settings-card-calc">
          <div className="settings-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="4" y="2" width="16" height="20" rx="2"/>
              <line x1="8" y1="6" x2="16" y2="6"/>
              <line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/>
              <line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/>
              <line x1="8" y1="18" x2="10" y2="18"/><line x1="14" y1="18" x2="16" y2="18"/>
            </svg>
          </div>
          <div className="settings-card-body">
            <div className="settings-card-title">1RM Calculator</div>
            <div className="settings-card-desc">Estimate your one-rep max using the Epley formula.</div>
            <div className="calc-1rm-row">
              <input
                className="calc-1rm-input"
                type="number"
                min="0"
                step="0.5"
                placeholder="Weight (kg)"
                value={calcWeight}
                onChange={e => setCalcWeight(e.target.value)}
              />
              <input
                className="calc-1rm-input"
                type="number"
                min="1"
                max="30"
                placeholder="Reps"
                value={calcReps}
                onChange={e => setCalcReps(e.target.value)}
              />
              {result1RM && (
                <div className="calc-1rm-result">
                  <span className="calc-1rm-label">Est. 1RM</span>
                  <span className="calc-1rm-value">{result1RM} <small>kg</small></span>
                </div>
              )}
            </div>
          </div>
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

      {/* KVKK Button */}
      <button className="kvkk-btn" onClick={() => setShowKvkk(true)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Privacy Policy &amp; Data Protection Notice
      </button>

      {/* KVKK Modal */}
      {showKvkk && (
        <div className="kvkk-overlay" onClick={() => setShowKvkk(false)}>
          <div className="kvkk-modal" onClick={e => e.stopPropagation()}>
            <div className="kvkk-modal-header">
              <div className="kvkk-modal-title">Privacy Policy</div>
              <button className="chart-modal-close" onClick={() => setShowKvkk(false)}>✕</button>
            </div>
            <pre className="kvkk-text">{KVKK_TEXT}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
