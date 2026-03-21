import { useState } from 'react';
import { supabase } from '../lib/supabase.js';

// mode: 'login' | 'register' | 'forgot' | 'reset'
export default function Auth({ resetMode }) {
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

  return (
    <div className="auth-screen">
      <div className="auth-brand">
        <div className="auth-logo">DOGAN</div>
        <div className="auth-logo-sub">PROGRESSIVE OVERLOAD</div>
      </div>

      <div className="auth-card">
        {/* Tabs — only for login/register */}
        {(mode === 'login' || mode === 'register') && (
          <div className="auth-tabs">
            <button className={`auth-tab${mode === 'login' ? ' active' : ''}`}
              onClick={() => switchMode('login')}>Sign In</button>
            <button className={`auth-tab${mode === 'register' ? ' active' : ''}`}
              onClick={() => switchMode('register')}>Register</button>
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
  );
}
