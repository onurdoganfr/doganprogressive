import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';

function getInitials(user) {
  const name = user?.user_metadata?.full_name || user?.email || '';
  return name.split(/[\s@]+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Profile({ user, onBack, onSignOut, onUserUpdate }) {
  const [name,            setName]           = useState(user?.user_metadata?.full_name || '');
  const [email,           setEmail]          = useState(user?.email || '');
  const [newPw,           setNewPw]          = useState('');
  const [confirmPw,       setConfirmPw]      = useState('');
  const [deleteInput,     setDeleteInput]    = useState('');
  const [session,         setSession]        = useState(null);

  const [nameMsg,   setNameMsg]   = useState(null); // { ok, text }
  const [emailMsg,  setEmailMsg]  = useState(null);
  const [pwMsg,     setPwMsg]     = useState(null);
  const [deleting,  setDeleting]  = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const initials = getInitials(user);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, []);

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

  async function saveEmail(e) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ email });
    if (error) flash(setEmailMsg, false, error.message);
    else flash(setEmailMsg, true, 'Confirmation sent to new email.');
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
    try {
      await supabase.rpc('delete_user_account');
    } catch (_) {}
    onSignOut();
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <button className="back-btn" onClick={onBack}>← Back</button>
      <div className="page-title">Profile</div>
      <div className="page-sub">Manage your account</div>

      {/* Avatar */}
      <div className="profile-avatar-wrap">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-avatar-name">{user?.user_metadata?.full_name || user?.email}</div>
        <div className="profile-avatar-email">{user?.email}</div>
      </div>

      {/* ── Name ──────────────────────────────────────────────── */}
      <div className="profile-section">
        <div className="profile-section-title">Display Name</div>
        <form className="profile-form" onSubmit={saveName}>
          <input
            className="profile-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            required
          />
          <button className="profile-save-btn" type="submit">Save</button>
        </form>
        {nameMsg && <div className={`profile-msg ${nameMsg.ok ? 'ok' : 'err'}`}>{nameMsg.text}</div>}
      </div>

      {/* ── Email ─────────────────────────────────────────────── */}
      <div className="profile-section">
        <div className="profile-section-title">Email Address</div>
        <form className="profile-form" onSubmit={saveEmail}>
          <input
            className="profile-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button className="profile-save-btn" type="submit">Save</button>
        </form>
        {emailMsg && <div className={`profile-msg ${emailMsg.ok ? 'ok' : 'err'}`}>{emailMsg.text}</div>}
      </div>

      {/* ── Password ──────────────────────────────────────────── */}
      <div className="profile-section">
        <div className="profile-section-title">Change Password</div>
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
          <div className="session-card-row">
            <div className="session-label">Session expires</div>
            <div className="session-val">{session ? formatDate(new Date(session.expires_at * 1000).toISOString()) : '—'}</div>
          </div>
        </div>
        <div className="session-btn-row">
          <button className="profile-session-btn" onClick={onSignOut}>
            Sign out this device
          </button>
          <button className="profile-session-btn outline" onClick={signOutAll}>
            Sign out all devices
          </button>
        </div>
      </div>

      {/* ── Delete Account ────────────────────────────────────── */}
      <div className="profile-section">
        <div className="profile-section-title">Account</div>
        {!showDelete ? (
          <button className="profile-delete-link" onClick={() => setShowDelete(true)}>
            Delete my account
          </button>
        ) : (
          <div className="delete-confirm-box">
            <p className="delete-confirm-text">
              This will permanently delete your account and all data. Type your email to confirm:
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
    </div>
  );
}
