
import { AppState } from '../../lib/state';
import '../../../styles/HabitTracker.css';

interface HabitTrackerProps {
  appState: AppState;
  updateAppState: (updater: (prevState: AppState) => AppState) => void;
  todayKey: string;
}

export function HabitTracker({ appState, updateAppState, todayKey }: HabitTrackerProps) {
  const habitsForToday = appState.habits; // All defined habits

  const handleToggleHabit = (habitId: string) => {
    updateAppState(prevState => ({
      ...prevState,
      days: {
        ...prevState.days,
        [todayKey]: {
          ...prevState.days[todayKey],
          habits: {
            ...prevState.days[todayKey]?.habits,
            [habitId]: !prevState.days[todayKey]?.habits?.[habitId],
          },
        },
      },
    }));
  };

  return (
    <div className="habit-tracker-container">
      <h3>Habits for Today</h3>
      <ul>
        {Object.values(habitsForToday).map(habit => (
          <li key={habit.id} className={appState.days[todayKey]?.habits?.[habit.id] ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={appState.days[todayKey]?.habits?.[habit.id] || false}
              onChange={() => handleToggleHabit(habit.id)}
            />
            <span>{habit.name}</span>
            <span className="habit-streak">🔥 {habit.streak}</span> {/* Placeholder for streak */}
          </li>
        ))}
        {Object.keys(habitsForToday).length === 0 && (
          <li className="placeholder-text">No habits set up yet.</li>
        )}
      </ul>
    </div>
  );
}