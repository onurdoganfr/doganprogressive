import { useState } from 'react';
import { safeParse } from './utils/storage.js';
import { migrateEntry } from './utils/workout.js';
import { DEFAULT_PROGRAMS } from './data/defaultPrograms.js';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import HistoryList from './components/HistoryList.jsx';
import DayDetail from './components/DayDetail.jsx';
import AddWorkout from './components/AddWorkout.jsx';

export default function App() {
  const [view,        setView]        = useState('dashboard');
  const [showAdd,     setShowAdd]     = useState(false);
  const [prevView,    setPrevView]    = useState('dashboard');
  const [history,     setHistory]     = useState(() => safeParse('gymHistory', []).map(migrateEntry));
  const [selectedDay, setSelectedDay] = useState(null);
  const [programs,    setPrograms]    = useState(() => {
    const raw = safeParse('gymPrograms', null);
    const saved = (raw && raw.length > 0) ? raw : DEFAULT_PROGRAMS;
    // migrate: remove auto-added Cardio duplicates from existing programs
    const migrated = saved.map(p => ({
      ...p,
      exercises: p.exercises.filter(e => e !== 'Cardio')
        .filter((e, i, arr) => arr.indexOf(e) === i)
    }));
    localStorage.setItem('gymPrograms', JSON.stringify(migrated));
    return migrated;
  });

  function savePrograms(updated) {
    setPrograms(updated);
    localStorage.setItem('gymPrograms', JSON.stringify(updated));
  }

  function handleSave(entry) {
    const updated = [...history, entry];
    setHistory(updated);
    localStorage.setItem('gymHistory', JSON.stringify(updated));
    setShowAdd(false);
    setView(prevView);
  }

  function handleDelete(id) {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('gymHistory', JSON.stringify(updated));
  }

  return (
    <div className="app">
      <Sidebar view={showAdd ? 'add' : view} setView={v => { setShowAdd(false); setView(v); }} onAdd={() => { setPrevView(view); setShowAdd(true); }} />
      <main className="main">
        {showAdd ? (
          <AddWorkout
            history={history}
            programs={programs}
            onSave={handleSave}
            onSaveProgram={prog => savePrograms([...programs, prog])}
            onDeleteProgram={id => savePrograms(programs.filter(p => p.id !== id))}
            onUpdateProgram={updated => savePrograms(programs.map(p => p.id === updated.id ? updated : p))}
            onCancel={() => { setShowAdd(false); setView(prevView); }}
          />
        ) : view === 'dashboard' ? <Dashboard history={history} programs={programs} />
          : view === 'history'   ? <HistoryList history={history} onSelect={day => { setSelectedDay(day); setView('detail'); }} onDelete={handleDelete} />
          : view === 'detail' && selectedDay ? <DayDetail day={selectedDay} onBack={() => setView('history')} />
          : null
        }
      </main>
    </div>
  );
}
