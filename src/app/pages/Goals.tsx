import '../styles/Goals.css';
import { AppState, computeGoalProgress } from '../lib/state';
import { useEffect } from 'react';

interface GoalsProps {
  appState: AppState;
  updateAppState?: (updater: (prevState: AppState) => AppState) => void;
}

export function Goals({ appState, updateAppState }: GoalsProps) {
  const goals = Object.values(appState.goals);

  // Update all goal progress when component mounts or when habits/goals change
  useEffect(() => {
    if (updateAppState) {
      let stateChanged = false;
      const updatedGoals = { ...appState.goals };

      goals.forEach(goal => {
        const newProgress = computeGoalProgress(appState, goal.id);
        if (newProgress !== goal.progress) {
          updatedGoals[goal.id] = { ...goal, progress: newProgress };
          stateChanged = true;
        }
      });

      if (stateChanged) {
        updateAppState(prevState => ({
          ...prevState,
          goals: updatedGoals
        }));
      }
    }
  }, [appState.habits, goals.length]); // Re-run when habits change or goals are added/removed

  const getLinkedHabitNames = (goalLinkedHabits: string[]) => {
    return goalLinkedHabits
      .map(habitId => appState.habits[habitId]?.name)
      .filter(Boolean)
      .join(', ');
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#4ade80'; // Green
    if (progress >= 50) return '#fbbf24'; // Yellow
    return '#f87171'; // Red
  };

  const getDaysUntilDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="goals-page-container">
      <h2>Goals & Resolutions</h2>

      {goals.length === 0 ? (
        <div className="empty-state">
          <p>📍 No goals set yet</p>
          <p className="subtext">Head to Settings to create your first goal and start tracking your progress!</p>
        </div>
      ) : (
        <div className="goals-grid">
          {goals.map(goal => {
            const linkedHabitNames = getLinkedHabitNames(goal.linkedHabits);
            const daysUntilDeadline = getDaysUntilDeadline(goal.deadline);
            const progressColor = getProgressColor(goal.progress);

            return (
              <div key={goal.id} className="goal-card">
                <div className="goal-header">
                  <h3>{goal.title}</h3>
                  {goal.deadline && (
                    <span className={`deadline-badge ${daysUntilDeadline && daysUntilDeadline < 30 ? 'urgent' : ''}`}>
                      {daysUntilDeadline !== null && daysUntilDeadline >= 0
                        ? `${daysUntilDeadline} days left`
                        : daysUntilDeadline !== null && daysUntilDeadline < 0
                          ? `${Math.abs(daysUntilDeadline)} days overdue`
                          : ''}
                    </span>
                  )}
                </div>

                <div className="goal-body">
                  {linkedHabitNames ? (
                    <div className="linked-habits">
                      <span className="label">Linked Habits:</span>
                      <span className="habits-list">{linkedHabitNames}</span>
                    </div>
                  ) : (
                    <p className="no-habits">No habits linked</p>
                  )}

                  {goal.deadline && (
                    <div className="deadline-info">
                      <span className="label">Deadline:</span>
                      <span className="date">{new Date(goal.deadline).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                  )}
                </div>

                <div className="goal-progress">
                  <div className="progress-header">
                    <span className="progress-label">Progress</span>
                    <span className="progress-percentage" style={{ color: progressColor }}>
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="progress-bar-large">
                    <div
                      className="progress-fill-large"
                      style={{
                        width: `${goal.progress}%`,
                        backgroundColor: progressColor
                      }}
                    >
                      <div className="progress-shine"></div>
                    </div>
                  </div>
                </div>

                <div className="goal-status">
                  {goal.progress === 100 ? (
                    <span className="status-badge completed">✨ Completed!</span>
                  ) : goal.progress >= 75 ? (
                    <span className="status-badge on-track">🚀 On Track</span>
                  ) : goal.progress >= 50 ? (
                    <span className="status-badge moderate">💪 Keep Going</span>
                  ) : (
                    <span className="status-badge needs-attention">⚡ Needs Attention</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="goals-footer">
        <p>💡 Tip: Link your daily habits to goals in Settings to automatically track progress!</p>
      </div>
    </div>
  );
}

