import { useState } from 'react';
import { supabase } from '../lib/supabase.js';

// mode: 'login' | 'register' | 'forgot' | 'reset'
export default function Auth({ resetMode, theme, onToggleTheme }) {
  const [mode, setMode]           = useState(resetMode ? 'reset' : 'login');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [name, setName]           = useState('');
  const [rememberMe, setRemember] = useState(true);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [done, setDone]           = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (mode === 'register') {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } },
      });
      if (error) setError(error.message);
      else setDone(true);

    } else if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message === 'Invalid login credentials'
          ? 'Wrong email or password.' : error.message);
      } else {
        if (rememberMe) localStorage.removeItem('gymNoRemember');
        else localStorage.setItem('gymNoRemember', '1');
        sessionStorage.setItem('gymActive', '1');
      }

    } else if (mode === 'forgot') {
      const redirectTo = window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) setError(error.message);
      else setDone(true);

    } else if (mode === 'reset') {
      if (password !== confirmPw) { setError('Passwords do not match.'); setLoading(false); return; }
      const { error } = await supabase.auth.updateUser({ password });
      if (error) setError(error.message);
      else setDone(true);
    }

    setLoading(false);
  }

  function switchMode(m) { setMode(m); setError(''); setDone(false); setEmail(''); setPassword(''); }

  const features = [
    { icon: '📈', text: 'Track every set, rep & weight' },
    { icon: '🏆', text: 'See your personal records' },
    { icon: '📊', text: 'Visualise your progress over time' },
    { icon: '📋', text: 'Manage workout programs' },
    { icon: '📏', text: 'Log body measurements' },
  ];

  return (
    <div className="auth-layout">

      {/* ── Left brand panel ───────────────────────────────── */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-brand-mark">
            <div className="auth-brand-logo">DOGAN</div>
            <div className="auth-brand-sub">PROGRESSIVE OVERLOAD</div>
          </div>

          <img
            src="/logo-source.png"
            alt="DOGAN logo"
            className="auth-brand-img"
          />

          <div className="auth-tagline">
            Train smarter.<br />Track everything.<br />Beat yourself.
          </div>

          <ul className="auth-features">
            {features.map((f, i) => (
              <li key={i} className="auth-feature-item">
                <span className="auth-feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Decorative blobs */}
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
      </div>

      {/* ── Right form panel ───────────────────────────────── */}
      <div className="auth-right">

        {/* Theme toggle */}
        <button className="auth-theme-btn" onClick={onToggleTheme} title="Toggle theme">
          {theme === 'dark' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        {/* Mobile brand (only visible on small screens) */}
        <div className="auth-mobile-brand">
          <div className="auth-mobile-logo">DOGAN</div>
          <div className="auth-mobile-sub">PROGRESSIVE OVERLOAD</div>
        </div>

        <div className="auth-form-wrap">

          {/* Tabs — only for login/register */}
          {(mode === 'login' || mode === 'register') && (
            <div className="auth-tabs">
              <button
                className={`auth-tab${mode === 'login' ? ' active' : ''}`}
                onClick={() => switchMode('login')}
              >Sign In</button>
              <button
                className={`auth-tab${mode === 'register' ? ' active' : ''}`}
                onClick={() => switchMode('register')}
              >Register</button>
            </div>
          )}

          {/* Forgot password header */}
          {mode === 'forgot' && (
            <div className="auth-mode-header">
              <button className="auth-back-link" onClick={() => switchMode('login')}>← Back to Sign In</button>
              <div className="auth-mode-title">Reset Password</div>
              <div className="auth-mode-sub">Enter your email and we'll send a reset link.</div>
            </div>
          )}

          {/* Reset password header */}
          {mode === 'reset' && (
            <div className="auth-mode-header">
              <div className="auth-mode-title">Set New Password</div>
              <div className="auth-mode-sub">Choose a new password for your account.</div>
            </div>
          )}

          {/* Done states */}
          {done && mode === 'register' && (
            <div className="auth-done">
              <div className="auth-done-icon">✓</div>
              <div className="auth-done-title">Account created!</div>
              <div className="auth-done-sub">Check your email to confirm, then sign in.</div>
              <button className="auth-submit" onClick={() => switchMode('login')}>Go to Sign In</button>
            </div>
          )}
          {done && mode === 'forgot' && (
            <div className="auth-done">
              <div className="auth-done-icon">✉</div>
              <div className="auth-done-title">Email sent!</div>
              <div className="auth-done-sub">Check your inbox for the password reset link.</div>
              <button className="auth-submit" onClick={() => switchMode('login')}>Back to Sign In</button>
            </div>
          )}
          {done && mode === 'reset' && (
            <div className="auth-done">
              <div className="auth-done-icon">✓</div>
              <div className="auth-done-title">Password updated!</div>
              <div className="auth-done-sub">You can now sign in with your new password.</div>
              <button className="auth-submit" onClick={() => switchMode('login')}>Sign In</button>
            </div>
          )}

          {/* Forms */}
          {!done && (
            <form onSubmit={handleSubmit}>
              {mode === 'register' && (
                <div className="auth-field">
                  <label className="auth-label">Name</label>
                  <input className="auth-input" type="text" value={name}
                    onChange={e => setName(e.target.value)} placeholder="Your name" required />
                </div>
              )}

              {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
                <div className="auth-field">
                  <label className="auth-label">Email</label>
                  <input className="auth-input" type="email" value={email}
                    onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
                </div>
              )}

              {(mode === 'login' || mode === 'register' || mode === 'reset') && (
                <div className="auth-field">
                  <label className="auth-label">{mode === 'reset' ? 'New Password' : 'Password'}</label>
                  <input className="auth-input" type="password" value={password}
                    onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
                </div>
              )}

              {mode === 'reset' && (
                <div className="auth-field">
                  <label className="auth-label">Confirm Password</label>
                  <input className="auth-input" type="password" value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••" required />
                </div>
              )}

              {mode === 'login' && (
                <div className="auth-login-row">
                  <label className="auth-remember">
                    <input type="checkbox" checked={rememberMe} onChange={e => setRemember(e.target.checked)} />
                    <span>Remember me</span>
                  </label>
                  <button type="button" className="auth-forgot-link" onClick={() => switchMode('forgot')}>
                    Forgot password?
                  </button>
                </div>
              )}

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? 'Please wait…'
                  : mode === 'login'    ? 'Sign In'
                  : mode === 'register' ? 'Create Account'
                  : mode === 'forgot'   ? 'Send Reset Link'
                  : 'Set New Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
