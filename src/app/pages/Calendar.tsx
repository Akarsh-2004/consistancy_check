import { useState } from 'react';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/Calendar.css';
import { AppState } from '../lib/state';

interface CalendarProps {
  appState: AppState;
}

export function Calendar({ appState }: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (date: any) => {
    setSelectedDate(date);
  };

  const selectedKey = selectedDate.toISOString().split('T')[0];
  const dayData = appState.days[selectedKey];

  return (
    <div className="calendar-page-container animate-fade">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem' }}>
        <section className="calendar-view-section">
          <div className="custom-calendar-wrapper">
            <ReactCalendar
              onChange={handleDateChange}
              value={selectedDate}
              className="react-calendar"
            />
          </div>
        </section>

        <section className="day-summary-sidebar">
          <div className="summary-header">
            <h3 className="text-serif italic">{selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
            <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>Historical Snapshot</p>
          </div>

          {!dayData ? (
            <div className="empty-day-state">
              <p>No records found for this date.</p>
            </div>
          ) : (
            <div className="day-data-content">
              {dayData.mood && (
                <div className="summary-item">
                  <span className="label">Disposition</span>
                  <span className="value">{['😞', '😐', '🙂', '😄', '😍'][dayData.mood - 1]}</span>
                </div>
              )}

              {dayData.journal && (
                <div className="summary-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span className="label">Reflections</span>
                  <p className="journal-preview">{dayData.journal.substring(0, 150)}{dayData.journal.length > 150 ? '...' : ''}</p>
                </div>
              )}

              <div className="summary-section">
                <h4>Disciplines</h4>
                <div className="mini-habit-list">
                  {Object.entries(appState.habits).map(([id, habit]) => (
                    <div key={id} className="mini-habit-item">
                      <span className={dayData.habits[id] ? 'status-dot completed' : 'status-dot'}></span>
                      <span className="name">{habit.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="summary-section">
                <h4>Directives</h4>
                <div className="mini-task-list">
                  {dayData.tasks.length === 0 ? <p className="text-muted">No tasks recorded.</p> : (
                    dayData.tasks.map(t => (
                      <div key={t.id} className="mini-task-item">
                        <span className="checkbox">{t.completed ? '✓' : '○'}</span>
                        <span className={t.completed ? 'text completed' : 'text'}>{t.text}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
