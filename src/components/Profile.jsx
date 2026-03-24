import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase.js';

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

function getInitials(user) {
  const name = user?.user_metadata?.full_name || user?.email || '';
  return name.split(/[\s@]+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Profile({ user, onBack, onSignOut, onUserUpdate }) {
  const [name,        setName]       = useState(user?.user_metadata?.full_name || '');
  const [newPw,       setNewPw]      = useState('');
  const [confirmPw,   setConfirmPw]  = useState('');
  const [deleteInput, setDeleteInput] = useState('');

  const [nameMsg,    setNameMsg]    = useState(null);
  const [pwMsg,      setPwMsg]      = useState(null);
  const [deleting,   setDeleting]   = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showKvkk,   setShowKvkk]  = useState(false);

  const [calcWeight, setCalcWeight] = useState('');
  const [calcReps,   setCalcReps]   = useState('');

  const result1RM = useMemo(() => {
    const w = parseFloat(calcWeight);
    const r = parseInt(calcReps);
    if (!w || !r || r <= 0 || w <= 0) return null;
    if (r === 1) return w;
    return Math.round(w * (1 + r / 30) * 2) / 2;
  }, [calcWeight, calcReps]);

  const initials = getInitials(user);

  function flash(setter, ok, text) {
    setter({ ok, text });
    setTimeout(() => setter(null), 4000);
  }

  async function saveName(e) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ data: { full_name: name } });
    if (error) flash(setNameMsg, false, error.message);
    else { flash(setNameMsg, true, 'Name updated.'); onUserUpdate?.(); }
  }

  async function savePassword(e) {
    e.preventDefault();
    if (newPw !== confirmPw) { flash(setPwMsg, false, 'Passwords do not match.'); return; }
    if (newPw.length < 6)   { flash(setPwMsg, false, 'Minimum 6 characters.'); return; }
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) flash(setPwMsg, false, error.message);
    else { flash(setPwMsg, true, 'Password changed.'); setNewPw(''); setConfirmPw(''); }
  }

  async function signOutAll() {
    await supabase.auth.signOut({ scope: 'global' });
    onSignOut();
  }

  async function deleteAccount() {
    if (deleteInput !== user?.email) return;
    setDeleting(true);
    try { await supabase.rpc('delete_user_account'); } catch (_) {}
    onSignOut();
  }

  return (
    <div className="profile-page">

      {/* ── User hero card ─────────────────────────────────────── */}
      <div className="profile-hero">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-hero-info">
          <div className="profile-avatar-name">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</div>
          <div className="profile-avatar-email">{user?.email}</div>
        </div>
      </div>

      {/* ── Account ───────────────────────────────────────────── */}
      <div className="profile-section">
        <div className="profile-section-title">Account</div>

        <form className="profile-form" onSubmit={saveName}>
          <input
            className="profile-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Display name"
            required
          />
          <button className="profile-save-btn" type="submit">Save</button>
        </form>
        {nameMsg && <div className={`profile-msg ${nameMsg.ok ? 'ok' : 'err'}`}>{nameMsg.text}</div>}

        <div className="profile-divider" />

        <form className="profile-form-col" onSubmit={savePassword}>
          <input
            className="profile-input"
            type="password"
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            placeholder="New password"
            minLength={6}
            required
          />
          <input
            className="profile-input"
            type="password"
            value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)}
            placeholder="Confirm new password"
            required
          />
          <button className="profile-save-btn" type="submit">Change Password</button>
        </form>
        {pwMsg && <div className={`profile-msg ${pwMsg.ok ? 'ok' : 'err'}`}>{pwMsg.text}</div>}
      </div>

      {/* ── Sessions ──────────────────────────────────────────── */}
      <div className="profile-section">
        <div className="profile-section-title">Sessions</div>
        <div className="session-card">
          <div className="session-card-row">
            <div className="session-label">Current device</div>
            <div className="session-badge">Active</div>
          </div>
          <div className="session-card-row">
            <div className="session-label">Last sign in</div>
            <div className="session-val">{formatDate(user?.last_sign_in_at)}</div>
          </div>
          <div className="session-card-row">
            <div className="session-label">Account created</div>
            <div className="session-val">{formatDate(user?.created_at)}</div>
          </div>
        </div>
        <div className="session-btn-row">
          <button className="profile-session-btn" onClick={onSignOut}>Sign out this device</button>
          <button className="profile-session-btn outline" onClick={signOutAll}>Sign out all devices</button>
        </div>
      </div>

      {/* ── 1RM Calculator ────────────────────────────────────── */}
      <div className="profile-section">
        <div className="profile-section-title">1RM Calculator</div>
        <div className="calc-1rm-row">
          <input
            className="calc-1rm-input"
            type="number" min="0" step="0.5"
            placeholder="Weight (kg)"
            value={calcWeight}
            onChange={e => setCalcWeight(e.target.value)}
          />
          <input
            className="calc-1rm-input"
            type="number" min="1" max="30"
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

      {/* ── Footer actions ────────────────────────────────────── */}
      <div className="profile-footer-actions">
        <button className="profile-footer-btn" onClick={() => setShowKvkk(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Privacy Policy
        </button>
        {!showDelete ? (
          <button className="profile-footer-btn profile-footer-btn--danger" onClick={() => setShowDelete(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
            Delete Account
          </button>
        ) : (
          <div className="delete-confirm-box">
            <p className="delete-confirm-text">
              Permanently deletes your account and all data. Type your email to confirm:
            </p>
            <input
              className="profile-input"
              type="email"
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              placeholder={user?.email}
            />
            <div className="delete-confirm-actions">
              <button className="profile-cancel-btn" onClick={() => { setShowDelete(false); setDeleteInput(''); }}>
                Cancel
              </button>
              <button
                className="profile-danger-btn"
                onClick={deleteAccount}
                disabled={deleteInput !== user?.email || deleting}
              >
                {deleting ? 'Deleting…' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Privacy Modal ─────────────────────────────────────── */}
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
