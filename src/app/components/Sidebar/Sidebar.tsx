import './Sidebar.css';
import { AppState } from '../../lib/state';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  appState?: AppState;
}

export function Sidebar({ currentView, setView, appState }: SidebarProps) {
  // Calculate best current streak
  const bestStreak = appState ? Object.values(appState.habits).reduce((max, habit) =>
    habit.streak > max ? habit.streak : max, 0
  ) : 0;

  const navItems = [
    { id: 'today', icon: '🗓️', label: 'Today' },
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'calendar', icon: '📅', label: 'Calendar' },
    { id: 'goals', icon: '🎯', label: 'Goals' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <aside className="sidebar-container">
      <div className="sidebar-header">
        <h2>LifeOS</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {navItems.map(item => (
            <li key={item.id}>
              <button
                className={currentView === item.id ? 'active' : ''}
                onClick={() => setView(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="daily-streak-indicator">
        <span style={{ fontSize: '1.5rem' }}>🔥</span> Best Streak: {bestStreak} {bestStreak === 1 ? 'day' : 'days'}
      </div>
    </aside>
  );
}