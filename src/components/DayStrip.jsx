import { useRef, useEffect } from 'react';
import { isSameDay } from '../utils/date.js';

export default function DayStrip({ history }) {
  const todayRef = useRef(null);
  const wrapRef  = useRef(null);
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const workoutDays = new Set(
    history.map(h => { const d = new Date(h.date); d.setHours(0,0,0,0); return d.getTime(); })
  );

  const days = Array.from({ length: 31 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() + i - 10); return d;
  });

  useEffect(() => {
    if (todayRef.current && wrapRef.current) {
      const wrap = wrapRef.current;
      const cell = todayRef.current;
      wrap.scrollLeft = cell.offsetLeft - wrap.offsetWidth / 2 + cell.offsetWidth / 2;
    }
  }, []);

  return (
    <div className="day-strip-wrap" ref={wrapRef}>
      <div className="day-strip">
        {days.map(d => {
          const isToday  = isSameDay(d, today);
          const isPast   = d < today;
          const hasDot   = workoutDays.has(d.getTime());
          let cls = 'day-cell';
          if (isToday) cls += ' today';
          else if (hasDot) cls += ' has-workout';
          else if (isPast) cls += ' past-empty';
          return (
            <div key={d.getTime()} className={cls} ref={isToday ? todayRef : null}>
              <span className="day-weekday">{d.toLocaleDateString('en-US', { weekday: 'narrow' })}</span>
              <span className="day-num">{d.getDate()}</span>
              {hasDot  && <span className="day-dot" />}
              {isToday && !hasDot && <span className="day-today-ring" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
