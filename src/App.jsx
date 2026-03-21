import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase.js';
import { migrateEntry } from './utils/workout.js';
import { DEFAULT_PROGRAMS } from './data/defaultPrograms.js';
import Auth from './components/Auth.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import HistoryList from './components/HistoryList.jsx';
import DayDetail from './components/DayDetail.jsx';
import AddWorkout from './components/AddWorkout.jsx';
import Measurements from './components/Measurements.jsx';
import Settings from './components/Settings.jsx';
import Profile from './components/Profile.jsx';

// ── DB ↔ App converters ──────────────────────────────────────────────────────

function dbToEntry(row) {
  return migrateEntry({
    id:          row.id,
    date:        row.date,
    type:        row.type,
    programName: row.program_name,
    tagClass:    row.tag_class,
    data:        row.data || {},
  });
}

function entryToDb(entry, userId) {
  return {
    id:           entry.id,
    user_id:      userId,
    date:         entry.date,
    type:         entry.type,
    program_name: entry.programName,
    tag_class:    entry.tagClass,
    data:         entry.data || {},
  };
}

function dbToProgram(row) {
  return { id: row.id, name: row.name, tagClass: row.tag_class, exercises: row.exercises || [] };
}

function programToDb(prog, userId) {
  return {
    id:        String(prog.id),
    user_id:   userId,
    name:      prog.name,
    tag_class: prog.tagClass || '',
    exercises: prog.exercises || [],
  };
}

function dbToMeasurement(row) {
  return { id: row.id, date: row.date, values: row.values || {} };
}

function measurementToDb(m, userId) {
  return { id: m.id, user_id: userId, date: m.date, values: m.values || {} };
}

// ── Component ────────────────────────────────────────────────────────────────

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('gymTheme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gymTheme', theme);
  }, [theme]);

  function toggleTheme() { setTheme(t => t === 'dark' ? 'light' : 'dark'); }

  // Auth
  const [user,       setUser]       = useState(null);
  const [authReady,  setAuthReady]  = useState(false);
  const [resetMode,  setResetMode]  = useState(false);

  // Data
  const [dataLoading,  setDataLoading]  = useState(false);
  const [history,      setHistory]      = useState([]);
  const [programs,     setPrograms]     = useState([]);
  const [measurements, setMeasurements] = useState([]);

  // Navigation
  const [view,        setView]        = useState('dashboard');
  const [showAdd,     setShowAdd]     = useState(false);
  const [prevView,    setPrevView]    = useState('dashboard');
  const [selectedDay, setSelectedDay] = useState(null);

  // ── Auth listener ──────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      // Remember Me: if user opted out and this is a new browser session, sign out
      if (session && localStorage.getItem('gymNoRemember') && !sessionStorage.getItem('gymActive')) {
        await supabase.auth.signOut();
        setUser(null);
      } else {
        setUser(session?.user ?? null);
      }
      setAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setResetMode(true);
        setUser(null);
        return;
      }
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Load data when user logs in ────────────────────────────────────────────
  useEffect(() => {
    if (user) loadData(user.id);
    else { setHistory([]); setPrograms([]); setMeasurements([]); }
  }, [user?.id]);

  async function loadData(userId) {
    setDataLoading(true);

    const [histRes, progRes, measRes] = await Promise.all([
      supabase.from('gym_history').select('*').eq('user_id', userId).order('date', { ascending: true }),
      supabase.from('gym_programs').select('*').eq('user_id', userId),
      supabase.from('gym_measurements').select('*').eq('user_id', userId).order('date', { ascending: true }),
    ]);

    setHistory((histRes.data || []).map(dbToEntry));

    const progs = progRes.data || [];
    if (progs.length === 0) await seedPrograms(userId);
    else setPrograms(progs.map(dbToProgram));

    setMeasurements((measRes.data || []).map(dbToMeasurement));
    setDataLoading(false);
  }

  async function seedPrograms(userId) {
    const rows = DEFAULT_PROGRAMS.map(p => programToDb(p, userId));
    const { data } = await supabase.from('gym_programs').insert(rows).select();
    setPrograms(data ? data.map(dbToProgram) : DEFAULT_PROGRAMS);
  }

  // ── History CRUD ───────────────────────────────────────────────────────────
  async function handleSave(entry) {
    await supabase.from('gym_history').insert(entryToDb(entry, user.id));
    setHistory(prev => [...prev, entry].sort((a, b) => new Date(a.date) - new Date(b.date)));
    setShowAdd(false);
    setView(prevView);
  }

  async function handleDelete(id) {
    await supabase.from('gym_history').delete().eq('id', id).eq('user_id', user.id);
    setHistory(prev => prev.filter(h => h.id !== id));
  }

  // ── Programs CRUD ──────────────────────────────────────────────────────────
  async function savePrograms(updated) {
    const rows = updated.map(p => programToDb(p, user.id));
    await supabase.from('gym_programs').upsert(rows, { onConflict: 'id,user_id' });
    setPrograms(updated);
  }

  async function handleDeleteProgram(id) {
    await supabase.from('gym_programs').delete().eq('id', String(id)).eq('user_id', user.id);
    setPrograms(prev => prev.filter(p => p.id !== id));
  }

  // ── Measurements CRUD ──────────────────────────────────────────────────────
  async function saveMeasurement(entry) {
    await supabase.from('gym_measurements').insert(measurementToDb(entry, user.id));
    setMeasurements(prev => [...prev, entry].sort((a, b) => new Date(a.date) - new Date(b.date)));
  }

  async function deleteMeasurement(id) {
    await supabase.from('gym_measurements').delete().eq('id', id).eq('user_id', user.id);
    setMeasurements(prev => prev.filter(m => m.id !== id));
  }

  // ── Backup import (from JSON file) ─────────────────────────────────────────
  async function handleImport(data) {
    setDataLoading(true);
    await Promise.all([
      supabase.from('gym_history').delete().eq('user_id', user.id),
      supabase.from('gym_programs').delete().eq('user_id', user.id),
      supabase.from('gym_measurements').delete().eq('user_id', user.id),
    ]);

    const hist = data.gymHistory || [];
    const prog = data.gymPrograms || [];
    const meas = data.gymMeasurements || [];

    if (hist.length) await supabase.from('gym_history').insert(hist.map(e => entryToDb(e, user.id)));
    if (prog.length) await supabase.from('gym_programs').insert(prog.map(p => programToDb(p, user.id)));
    else await seedPrograms(user.id);
    if (meas.length) await supabase.from('gym_measurements').insert(meas.map(m => measurementToDb(m, user.id)));

    await loadData(user.id);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (!authReady || (user && dataLoading && history.length === 0 && programs.length === 0)) {
    return (
      <div className="app-loading">
        <div className="app-loading-logo">DOGAN</div>
        <div className="app-loading-sub">PROGRESSIVE OVERLOAD</div>
      </div>
    );
  }

  if (resetMode) return <Auth resetMode />;
  if (!user) return <Auth />;

  return (
    <div className="app">
      <Sidebar
        view={showAdd ? 'add' : view}
        setView={v => { setShowAdd(false); setView(v); }}
        onAdd={() => { setPrevView(view); setShowAdd(true); }}
        theme={theme}
        onToggleTheme={toggleTheme}
        user={user}
        onProfile={() => { setShowAdd(false); setView('profile'); }}
        onSignOut={() => {
          localStorage.removeItem('gymNoRemember');
          sessionStorage.removeItem('gymActive');
          supabase.auth.signOut();
        }}
      />
      <div className="mobile-brand">DOGAN<span>Progressive Overload</span></div>
      <main className="main">
        {showAdd ? (
          <AddWorkout
            history={history}
            programs={programs}
            onSave={handleSave}
            onSaveProgram={prog => savePrograms([...programs, prog])}
            onDeleteProgram={handleDeleteProgram}
            onUpdateProgram={updated => savePrograms(programs.map(p => p.id === updated.id ? updated : p))}
            onCancel={() => { setShowAdd(false); setView(prevView); }}
          />
        ) : view === 'dashboard' ? (
          <Dashboard history={history} programs={programs} theme={theme} onToggleTheme={toggleTheme} />
        ) : view === 'history' ? (
          <HistoryList history={history} onSelect={day => { setSelectedDay(day); setView('detail'); }} onDelete={handleDelete} />
        ) : view === 'detail' && selectedDay ? (
          <DayDetail day={selectedDay} onBack={() => setView('history')} />
        ) : view === 'measurements' ? (
          <Measurements measurements={measurements} onSave={saveMeasurement} onDelete={deleteMeasurement} />
        ) : view === 'settings' ? (
          <Settings
            history={history}
            programs={programs}
            measurements={measurements}
            onImport={handleImport}
            onSignOut={() => supabase.auth.signOut()}
          />
        ) : view === 'profile' ? (
          <Profile
            user={user}
            onBack={() => setView('dashboard')}
            onSignOut={() => {
              localStorage.removeItem('gymNoRemember');
              sessionStorage.removeItem('gymActive');
              supabase.auth.signOut();
            }}
            onUserUpdate={() => supabase.auth.refreshSession()}
          />
        ) : null}
      </main>
    </div>
  );
}
