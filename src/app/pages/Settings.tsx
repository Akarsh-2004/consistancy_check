import { useState } from 'react';
import '../styles/Settings.css';
import { AppState, createHabit, deleteHabit, createGoal, deleteGoal } from '../lib/state';

interface SettingsProps {
  appState: AppState;
  updateAppState: (updater: (prevState: AppState) => AppState) => void;
}

export function Settings({ appState, updateAppState }: SettingsProps) {
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitFrequency, setNewHabitFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDeadline, setNewGoalDeadline] = useState('');
  const [selectedGoalHabits, setSelectedGoalHabits] = useState<string[]>([]);

  const habits = Object.values(appState.habits);
  const goals = Object.values(appState.goals);

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      updateAppState(prevState => createHabit(prevState, newHabitName, newHabitFrequency, 1));
      setNewHabitName('');
      setNewHabitFrequency('daily');
    }
  };

  const handleDeleteHabit = (habitId: string) => {
    if (confirm('Are you sure you want to delete this habit? This will remove all history.')) {
      updateAppState(prevState => deleteHabit(prevState, habitId));
    }
  };

  const handleAddGoal = () => {
    if (newGoalTitle.trim()) {
      updateAppState(prevState => createGoal(
        prevState,
        newGoalTitle,
        selectedGoalHabits,
        newGoalDeadline || null
      ));
      setNewGoalTitle('');
      setNewGoalDeadline('');
      setSelectedGoalHabits([]);
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      updateAppState(prevState => deleteGoal(prevState, goalId));
    }
  };

  const handleToggleTheme = () => {
    updateAppState(prevState => ({
      ...prevState,
      user: {
        ...prevState.user,
        settings: {
          ...prevState.user.settings,
          theme: prevState.user.settings.theme === 'dark' ? 'light' : 'dark'
        }
      }
    }));
  };

  const handleToggleNotifications = () => {
    updateAppState(prevState => ({
      ...prevState,
      user: {
        ...prevState.user,
        settings: {
          ...prevState.user.settings,
          notifications: !prevState.user.settings.notifications
        }
      }
    }));
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(appState, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lifeos-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedState = JSON.parse(event.target?.result as string);
          if (confirm('This will replace all your current data. Are you sure?')) {
            updateAppState(() => importedState);
            alert('Data imported successfully!');
          }
        } catch (error) {
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleToggleHabitInGoal = (habitId: string) => {
    setSelectedGoalHabits(prev =>
      prev.includes(habitId)
        ? prev.filter(id => id !== habitId)
        : [...prev, habitId]
    );
  };

  return (
    <div className="settings-container">
      <h2>Settings & Management</h2>

      {/* Habit Management */}
      <section className="settings-section">
        <h3>Manage Habits</h3>
        <div className="add-item-form">
          <input
            type="text"
            placeholder="Habit name (e.g., Read, Exercise)"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddHabit()}
          />
          <select
            value={newHabitFrequency}
            onChange={(e) => setNewHabitFrequency(e.target.value as 'daily' | 'weekly' | 'custom')}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="custom">Custom</option>
          </select>
          <button onClick={handleAddHabit}>Add Habit</button>
        </div>

        <div className="items-list">
          {habits.length === 0 ? (
            <p className="placeholder-text">No habits yet. Add your first habit above!</p>
          ) : (
            habits.map(habit => (
              <div key={habit.id} className="item-card">
                <div className="item-info">
                  <h4>{habit.name}</h4>
                  <p>Frequency: {habit.frequency} | Current Streak: 🔥 {habit.streak} days</p>
                  <p>Total Completions: {Object.values(habit.history).filter(Boolean).length}</p>
                </div>
                <button className="delete-btn" onClick={() => handleDeleteHabit(habit.id)}>Delete</button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Goal Management */}
      <section className="settings-section">
        <h3>Manage Goals</h3>
        <div className="add-item-form goal-form">
          <input
            type="text"
            placeholder="Goal title (e.g., Read 20 books this year)"
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
          />
          <input
            type="date"
            placeholder="Deadline (optional)"
            value={newGoalDeadline}
            onChange={(e) => setNewGoalDeadline(e.target.value)}
          />

          {habits.length > 0 && (
            <div className="habit-selector">
              <p>Link Habits:</p>
              <div className="habit-checkboxes">
                {habits.map(habit => (
                  <label key={habit.id} className="habit-checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedGoalHabits.includes(habit.id)}
                      onChange={() => handleToggleHabitInGoal(habit.id)}
                    />
                    <span>{habit.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button onClick={handleAddGoal}>Add Goal</button>
        </div>

        <div className="items-list">
          {goals.length === 0 ? (
            <p className="placeholder-text">No goals yet. Set your first goal above!</p>
          ) : (
            goals.map(goal => (
              <div key={goal.id} className="item-card goal-card">
                <div className="item-info">
                  <h4>{goal.title}</h4>
                  {goal.deadline && <p>Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>}
                  <p>Linked Habits: {goal.linkedHabits.length > 0
                    ? goal.linkedHabits.map(id => appState.habits[id]?.name).filter(Boolean).join(', ')
                    : 'None'}
                  </p>
                  <div className="goal-progress">
                    <span>Progress: {goal.progress}%</span>
                    <div className="progress-bar-small">
                      <div className="progress-fill-small" style={{ width: `${goal.progress}%` }}></div>
                    </div>
                  </div>
                </div>
                <button className="delete-btn" onClick={() => handleDeleteGoal(goal.id)}>Delete</button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* App Settings */}
      <section className="settings-section">
        <h3>App Preferences</h3>
        <div className="preference-item">
          <div className="preference-info">
            <h4>Theme</h4>
            <p>Current: {appState.user.settings.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
          </div>
          <button onClick={handleToggleTheme}>
            {appState.user.settings.theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        <div className="preference-item">
          <div className="preference-info">
            <h4>Notifications</h4>
            <p>{appState.user.settings.notifications ? 'Enabled' : 'Disabled'}</p>
          </div>
          <button onClick={handleToggleNotifications}>
            {appState.user.settings.notifications ? '🔕 Disable' : '🔔 Enable'}
          </button>
        </div>

        <div className="preference-item">
          <div className="preference-info">
            <h4>Week Start Day</h4>
            <p>Current: {appState.user.settings.weekStart === 'monday' ? 'Monday' : 'Sunday'}</p>
          </div>
          <button onClick={() => updateAppState(prevState => ({
            ...prevState,
            user: {
              ...prevState.user,
              settings: {
                ...prevState.user.settings,
                weekStart: prevState.user.settings.weekStart === 'monday' ? 'sunday' : 'monday'
              }
            }
          }))}>
            Toggle
          </button>
        </div>
      </section>

      {/* Data Management */}
      <section className="settings-section">
        <h3>Data Management</h3>
        <div className="data-actions">
          <button className="action-btn export-btn" onClick={handleExportData}>
            📥 Export Data
          </button>
          <label className="action-btn import-btn">
            📤 Import Data
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              style={{ display: 'none' }}
            />
          </label>
        </div>
        <p className="info-text">
          Export your data to backup or import previously exported data.
        </p>
      </section>
    </div>
  );
}