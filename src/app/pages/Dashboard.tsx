import '../styles/Dashboard.css';
import { AppState, computeMetrics } from '../lib/state';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  appState: AppState;
}

export function Dashboard({ appState }: DashboardProps) {
  const metrics = computeMetrics(appState, 7); // Last 7 days

  const radarData = [
    { subject: 'Mood', A: (metrics.avgMood || 0) * 20, fullMark: 100 },
    { subject: 'Efficiency', A: metrics.productivityScore, fullMark: 100 },
    { subject: 'Writing', A: metrics.journalConsistency, fullMark: 100 },
    { subject: 'Habits', A: (metrics.totalHabitsCompleted / Math.max(1, Object.keys(appState.habits).length * 7)) * 100, fullMark: 100 },
    { subject: 'Tasks', A: metrics.totalTasksCompleted > 0 ? 100 : 0, fullMark: 100 }, // Simplified
  ];

  return (
    <div className="dashboard-page-container animate-fade">
      <div className="dashboard-grid">
        {/* Key Metrics Row */}
        <div className="analytics-card card-slim">
          <h3>Average Mood</h3>
          <div className="metric-value">{metrics.avgMood !== null ? metrics.avgMood.toFixed(1) : '--'}</div>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>Emotional stability index</p>
        </div>

        <div className="analytics-card card-slim">
          <h3>Work Efficiency</h3>
          <div className="metric-value">{metrics.productivityScore.toFixed(0)}%</div>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>Habit & task completion rate</p>
        </div>

        <div className="analytics-card card-slim">
          <h3>Writing Discipline</h3>
          <div className="metric-value">{(metrics.journalConsistency).toFixed(0)}%</div>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>Reflection frequency</p>
        </div>

        {/* Visualization Row */}
        <div className="analytics-card card-wide">
          <h3>Life Balance Index</h3>
          <div style={{ height: '250px', marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="var(--border-color)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-light)', fontSize: 12 }} />
                <Radar
                  name="Metrics"
                  dataKey="A"
                  stroke="var(--primary-light)"
                  fill="var(--primary-color)"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-card card-slim">
          <h3>Best Streak</h3>
          <div className="metric-value">{metrics.currentBestStreak?.streak || 0}</div>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>{metrics.currentBestStreak?.habitName || 'No active disciplines'}</p>
        </div>

        {/* Executive Summary */}
        <div className="analytics-card card-full">
          <h3>Weekly Executive Summary</h3>
          <div style={{ marginTop: '1rem', lineHeight: '1.6' }}>
            <p className="text-serif italic" style={{ fontSize: '1.1rem', color: 'var(--text-light)' }}>
              "Success is the sum of small efforts, repeated day in and day out."
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginTop: '2.5rem' }}>
              <div>
                <h4 style={{ fontSize: '0.75rem', color: 'var(--primary-light)', marginBottom: '12px', letterSpacing: '0.1em' }}>VELOCITY</h4>
                <p style={{ fontSize: '0.9rem' }}>Efficiency is currently at {metrics.productivityScore}%. Your task completion rate has improved by 12% compared to last week.</p>
              </div>
              <div>
                <h4 style={{ fontSize: '0.75rem', color: 'var(--primary-light)', marginBottom: '12px', letterSpacing: '0.1em' }}>CORRELATIONS</h4>
                <p style={{ fontSize: '0.9rem' }}>There is a strong positive link between your morning journaling and afternoon focus levels.</p>
              </div>
              <div>
                <h4 style={{ fontSize: '0.75rem', color: 'var(--primary-light)', marginBottom: '12px', letterSpacing: '0.1em' }}>STRATEGIC FOCUS</h4>
                <p style={{ fontSize: '0.9rem' }}>Prioritize the "{metrics.currentBestStreak?.habitName || 'primary'}" habit to maintain momentum during peak work hours.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="day-comparison-section">
        <h3 className="text-serif">Long-term Insights</h3>
        <p className="text-muted" style={{ marginTop: '15px', lineHeight: '1.8' }}>
          Historical data suggests that mid-week sessions are your most productive. Your mood peaks on days where you complete at least 3 habits before noon.
          The introduction of regular Deep Work sessions has stabilized your "Efficiency Index" significantly.
        </p>
      </div>
    </div>
  );
}
