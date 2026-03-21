import { useState } from 'react';
import { supabase } from '../lib/supabase.js';

export default function Auth() {
  const [mode, setMode]           = useState('login');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
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
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) setError(error.message);
      else setDone(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message === 'Invalid login credentials'
          ? 'Wrong email or password.'
          : error.message);
      } else {
        // Remember Me logic
        if (rememberMe) {
          localStorage.removeItem('gymNoRemember');
        } else {
          localStorage.setItem('gymNoRemember', '1');
        }
        sessionStorage.setItem('gymActive', '1');
      }
    }
    setLoading(false);
  }

  return (
    <div className="auth-screen">
      <div className="auth-brand">
        <div className="auth-logo">DOGAN</div>
        <div className="auth-logo-sub">PROGRESSIVE OVERLOAD</div>
      </div>

      <div className="auth-card">
        <div className="auth-tabs">
          <button
            className={`auth-tab${mode === 'login' ? ' active' : ''}`}
            onClick={() => { setMode('login'); setError(''); setDone(false); }}
          >Sign In</button>
          <button
            className={`auth-tab${mode === 'register' ? ' active' : ''}`}
            onClick={() => { setMode('register'); setError(''); setDone(false); }}
          >Register</button>
        </div>

        {done ? (
          <div className="auth-done">
            <div className="auth-done-icon">✓</div>
            <div className="auth-done-title">Account created!</div>
            <div className="auth-done-sub">Check your email to confirm, then sign in.</div>
            <button className="auth-submit" onClick={() => { setMode('login'); setDone(false); }}>
              Go to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="auth-field">
                <label className="auth-label">Name</label>
                <input
                  className="auth-input"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
            )}
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input
                className="auth-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input
                className="auth-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {mode === 'login' && (
              <label className="auth-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRemember(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
            )}

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
