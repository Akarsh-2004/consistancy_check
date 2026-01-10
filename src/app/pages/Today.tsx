import { useState, useEffect } from 'react';
import '../styles/Today.css';
import { AppState, getTodayKey, Task, updateStreak, getDateRange, getDayProductivityScore } from '../lib/state';
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts';

interface TodayProps {
  appState: AppState;
  updateAppState: (updater: (prevState: AppState) => AppState) => void;
}

export function Today({ appState, updateAppState }: TodayProps) {
  const todayKey = getTodayKey();
  const todayData = appState.days[todayKey];

  const [newTaskText, setNewTaskText] = useState('');

  // Local state for the ticker
  const [displayTime, setDisplayTime] = useState(() => {
    const { isRunning, lastStartedAt, remainingSeconds } = appState.focusTimer;
    if (isRunning && lastStartedAt) {
      const elapsed = Math.floor((Date.now() - lastStartedAt) / 1000);
      return Math.max(0, remainingSeconds - elapsed);
    }
    return remainingSeconds;
  });

  // Ticker effect
  useEffect(() => {
    let interval: any;
    if (appState.focusTimer.isRunning && displayTime > 0) {
      interval = setInterval(() => {
        setDisplayTime((prev) => {
          if (prev <= 1) {
            // Signal completion on next tick or here
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (displayTime === 0 && appState.focusTimer.isRunning) {
      // Timer finished while active
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [appState.focusTimer.isRunning, displayTime]);

  // Sync back to global state periodically? No, only on discrete actions.
  // But if the user leaves the page, we should save the 'remainingSeconds' accurately.
  // Actually, we don't need to if isRunning is true, because we use lastStartedAt.
  // But when PAUSING, we MUST save it.

  const handleTimerComplete = () => {
    updateAppState(prevState => ({
      ...prevState,
      focusTimer: {
        ...prevState.focusTimer,
        isRunning: false,
        lastStartedAt: null,
        remainingSeconds: 0
      }
    }));
    alert("Focus session complete. Take a breath.");
  };

  const handleStartTimer = () => {
    updateAppState(prevState => ({
      ...prevState,
      focusTimer: {
        ...prevState.focusTimer,
        isRunning: true,
        lastStartedAt: Date.now(),
        remainingSeconds: displayTime
      }
    }));
  };

  const handlePauseTimer = () => {
    updateAppState(prevState => ({
      ...prevState,
      focusTimer: {
        ...prevState.focusTimer,
        isRunning: false,
        lastStartedAt: null,
        remainingSeconds: displayTime
      }
    }));
  };

  const handleResetTimer = () => {
    const defaultSecs = appState.focusTimer.duration * 60;
    setDisplayTime(defaultSecs);
    updateAppState(prevState => ({
      ...prevState,
      focusTimer: {
        ...prevState.focusTimer,
        isRunning: false,
        lastStartedAt: null,
        remainingSeconds: defaultSecs
      }
    }));
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const mins = parseInt(e.target.value) || 0;
    const secs = mins * 60;
    setDisplayTime(secs);
    updateAppState(prevState => ({
      ...prevState,
      focusTimer: {
        ...prevState.focusTimer,
        duration: mins,
        remainingSeconds: secs,
        isRunning: false,
        lastStartedAt: null
      }
    }));
  };

  const formatFocusTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleJournalChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateAppState(prevState => ({
      ...prevState,
      days: { ...prevState.days, [todayKey]: { ...prevState.days[todayKey], journal: e.target.value } },
    }));
  };

  const handleMoodChange = (mood: number) => {
    updateAppState(prevState => ({
      ...prevState,
      days: { ...prevState.days, [todayKey]: { ...prevState.days[todayKey], mood } },
    }));
  };

  const handleDayRatingChange = (rating: number) => {
    updateAppState(prevState => ({
      ...prevState,
      days: { ...prevState.days, [todayKey]: { ...prevState.days[todayKey], rating } },
    }));
  };

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      const newTask: Task = { id: String(Date.now()), text: newTaskText, completed: false };
      updateAppState(prevState => ({
        ...prevState,
        days: {
          ...prevState.days,
          [todayKey]: {
            ...prevState.days[todayKey],
            tasks: [...(prevState.days[todayKey]?.tasks || []), newTask],
          },
        },
      }));
      setNewTaskText('');
    }
  };

  const handleToggleTask = (taskId: string) => {
    updateAppState(prevState => ({
      ...prevState,
      days: {
        ...prevState.days,
        [todayKey]: {
          ...prevState.days[todayKey],
          tasks: (prevState.days[todayKey]?.tasks || []).map(t => t.id === taskId ? { ...t, completed: !t.completed } : t),
        },
      },
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    updateAppState(prevState => ({
      ...prevState,
      days: {
        ...prevState.days,
        [todayKey]: {
          ...prevState.days[todayKey],
          tasks: (prevState.days[todayKey]?.tasks || []).filter(t => t.id !== taskId),
        },
      },
    }));
  };

  const handleToggleHabit = (habitId: string) => {
    updateAppState(prevState => {
      const isCompleted = prevState.days[todayKey]?.habits?.[habitId] || false;
      let newState = {
        ...prevState,
        days: {
          ...prevState.days,
          [todayKey]: {
            ...prevState.days[todayKey],
            habits: { ...prevState.days[todayKey]?.habits, [habitId]: !isCompleted },
          },
        },
      };
      return updateStreak(newState, habitId, todayKey, !isCompleted);
    });
  };

  const habits = Object.values(appState.habits);
  const last7Days = getDateRange(todayKey, 7);
  const moodChartData = last7Days.map(dateKey => ({
    date: new Date(dateKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mood: appState.days[dateKey]?.mood || 0,
  }));

  const todayProductivityScore = getDayProductivityScore(appState, todayKey);

  return (
    <div className="today-container animate-fade">
      <section className="journal-section">
        <div className="journal-header">
          <h3 className="text-muted">Day Reflections</h3>
          <span className="text-serif italic" style={{ fontSize: '0.9rem' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
        <textarea
          className="journal-editor"
          placeholder="What occupies your mind today?"
          value={todayData?.journal || ''}
          onChange={handleJournalChange}
        ></textarea>

        <div className="interaction-row">
          <div className="control-group">
            <span className="control-label">Disposition</span>
            <div className="selector-buttons">
              {['😞', '😐', '🙂', '😄', '😍'].map((emoji, idx) => (
                <button
                  key={idx}
                  className={`selector-btn ${todayData?.mood === idx + 1 ? 'active' : ''}`}
                  onClick={() => handleMoodChange(idx + 1)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <span className="control-label">Day Quality</span>
            <div className="selector-buttons">
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  className={`selector-btn ${todayData?.rating === num ? 'active' : ''}`}
                  onClick={() => handleDayRatingChange(num)}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <section className="tasks-section">
            <h3>Directives</h3>
            <div className="task-input-wrapper">
              <input
                type="text"
                className="task-input"
                placeholder="Identify a task..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              />
              <button className="primary" onClick={handleAddTask}>Add</button>
            </div>
            <ul className="task-list">
              {(todayData?.tasks || []).map(task => (
                <li key={task.id} className="task-item">
                  <div className="task-checkbox" onClick={() => handleToggleTask(task.id)}>
                    {task.completed && <span style={{ fontSize: '12px' }}>✓</span>}
                  </div>
                  <span className={`task-text ${task.completed ? 'completed' : ''}`} style={{ flex: 1 }}>{task.text}</span>
                  <button className="delete-btn" onClick={() => handleDeleteTask(task.id)}>Delete</button>
                </li>
              ))}
            </ul>
          </section>

          <section className="habits-section">
            <h3>Disciplines</h3>
            <div className="habits-grid">
              {habits.map(habit => (
                <div
                  key={habit.id}
                  className={`habit-card ${todayData?.habits?.[habit.id] ? 'completed' : ''}`}
                  onClick={() => handleToggleHabit(habit.id)}
                >
                  <div className="justify-between flex items-center">
                    <span className="habit-name">{habit.name}</span>
                    {habit.streak > 0 && <span className="text-muted" style={{ fontSize: '0.8rem' }}>{habit.streak}d</span>}
                  </div>
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: todayData?.habits?.[habit.id] ? '100%' : '0%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <section className="focus-mode-section">
            <h3 className="control-label" style={{ marginBottom: '1rem' }}>Deep Work Session</h3>
            {!appState.focusTimer.isRunning ? (
              <div style={{ marginBottom: '1rem' }}>
                <span className="text-muted" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>Duration (minutes)</span>
                <input
                  type="number"
                  value={appState.focusTimer.duration}
                  onChange={handleDurationChange}
                  min="1"
                  max="180"
                  className="focus-duration-input"
                  style={{ width: '100%', textAlign: 'center', fontSize: '1.25rem', padding: '8px' }}
                />
              </div>
            ) : (
              <div className="focus-timer">{formatFocusTime(displayTime)}</div>
            )}

            <button
              onClick={appState.focusTimer.isRunning ? handlePauseTimer : handleStartTimer}
              className={appState.focusTimer.isRunning ? '' : 'primary'}
              style={{ width: '100%' }}
            >
              {appState.focusTimer.isRunning ? 'Pause Session' : 'Begin Focus'}
            </button>
            {(displayTime !== appState.focusTimer.duration * 60 || (displayTime === 0 && !appState.focusTimer.isRunning)) && !appState.focusTimer.isRunning && (
              <button
                onClick={handleResetTimer}
                style={{ marginTop: '10px', width: '100%', background: 'transparent' }}
              >
                Reset
              </button>
            )}
          </section>

          <section className="insight-card">
            <h3 className="control-label">Sentiment Trend</h3>
            <div style={{ height: '80px', marginTop: '10px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodChartData}>
                  <Tooltip content={() => null} />
                  <Line type="monotone" dataKey="mood" stroke="#64748b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="insight-card">
            <h3 className="control-label">Productivity Index</h3>
            <div className="score-wrapper" style={{ marginTop: '1rem' }}>
              <span className="score-value">{todayProductivityScore}%</span>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>Efficiency Rating</span>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
