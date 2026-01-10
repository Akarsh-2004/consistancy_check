import { v4 as uuidv4 } from 'uuid';

export interface UserSettings {
  theme: 'dark' | 'light';
  weekStart: 'monday' | 'sunday';
  notifications: boolean;
}

export interface Day {
  journal: string;
  mood: number | null; // 1-5 scale
  rating: number | null; // 1-5 scale
  habits: { [habitId: string]: boolean }; // habitId -> completed (true/false)
  tasks: Task[];
  alarms: Alarm[];
  metrics: { [key: string]: number }; // Computed metrics for the day
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface Alarm {
  id: string;
  time: string; // e.g., "07:00"
  label: string;
  repeat: 'daily' | 'weekdays' | 'weekends' | 'never';
}

export interface FocusTimer {
  duration: number; // in minutes
  remainingSeconds: number;
  lastStartedAt: number | null; // null if paused
  isRunning: boolean;
}

export interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'custom';
  target: number; // e.g., 1 (for daily completion), or 5 (for weekly target)
  streak: number;
  history: { [dateKey: string]: boolean }; // dateKey -> completed (true/false)
}

export interface Goal {
  id: string;
  title: string;
  linkedHabits: string[]; // Array of habit IDs
  progress: number; // Percentage or count
  deadline: string | null; // e.g., "2026-12-31"
}

export interface AppState {
  user: {
    id: string;
    name: string;
    settings: UserSettings;
  };
  days: { [dateKey: string]: Day }; // e.g., "2026-01-09" -> Day object
  habits: { [habitId: string]: Habit };
  goals: { [goalId: string]: Goal };
  focusTimer: FocusTimer;
}

export const defaultState: AppState = {
  user: {
    id: uuidv4(),
    name: 'User',
    settings: {
      theme: 'dark',
      weekStart: 'monday',
      notifications: true,
    },
  },
  days: {},
  habits: {
    'h1': {
      id: 'h1',
      name: 'Meditate',
      frequency: 'daily',
      target: 1,
      streak: 0,
      history: {},
    },
    'h2': {
      id: 'h2',
      name: 'Read',
      frequency: 'daily',
      target: 1,
      streak: 0,
      history: {},
    },
  },
  goals: {},
  focusTimer: {
    duration: 25,
    remainingSeconds: 25 * 60,
    lastStartedAt: null,
    isRunning: false,
  },
};

const LOCAL_STORAGE_KEY = 'lifeos_state';

export function loadState(): AppState {
  try {
    const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (serializedState === null) {
      return defaultState;
    }
    const loadedState: AppState = JSON.parse(serializedState);

    // Merge with default state to handle new properties in defaultState after updates
    return {
      ...defaultState,
      ...loadedState,
      user: { ...defaultState.user, ...loadedState.user, settings: { ...defaultState.user.settings, ...loadedState.user.settings } },
      days: loadedState.days || {},
      habits: loadedState.habits || {},
      goals: loadedState.goals || {},
      focusTimer: loadedState.focusTimer || defaultState.focusTimer,
    };
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
    return defaultState;
  }
}

export function persistState(state: AppState) {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(LOCAL_STORAGE_KEY, serializedState);
  } catch (error) {
    console.error('Error persisting state to localStorage:', error);
  }
}

export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function ensureDay(state: AppState, dateKey: string): AppState {
  if (!state.days[dateKey]) {
    return {
      ...state,
      days: {
        ...state.days,
        [dateKey]: {
          journal: '',
          mood: null,
          rating: null,
          habits: {},
          tasks: [],
          alarms: [],
          metrics: {},
        },
      },
    };
  }
  return state;
}


export function getPreviousDate(dateKey: string): string {
  const date = new Date(dateKey);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

export function getNextDate(dateKey: string): string {
  const date = new Date(dateKey);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
}

// Habit Streak Calculation
export function updateStreak(state: AppState, habitId: string, dateKey: string, completed: boolean): AppState {
  const habit = state.habits[habitId];
  if (!habit) return state;

  const updatedHistory = { ...habit.history, [dateKey]: completed };

  // Calculate streak by checking consecutive days backwards from dateKey
  let currentStreak = 0;
  let checkDate = dateKey;

  while (updatedHistory[checkDate]) {
    currentStreak++;
    checkDate = getPreviousDate(checkDate);
  }

  return {
    ...state,
    habits: {
      ...state.habits,
      [habitId]: {
        ...habit,
        history: updatedHistory,
        streak: currentStreak,
      },
    },
  };
}

// Habit CRUD Operations
export function createHabit(state: AppState, name: string, frequency: 'daily' | 'weekly' | 'custom', target: number): AppState {
  const id = uuidv4();
  const newHabit: Habit = {
    id,
    name,
    frequency,
    target,
    streak: 0,
    history: {},
  };

  return {
    ...state,
    habits: {
      ...state.habits,
      [id]: newHabit,
    },
  };
}

export function deleteHabit(state: AppState, habitId: string): AppState {
  const { [habitId]: removed, ...remainingHabits } = state.habits;

  // Remove habit from all goals
  const updatedGoals = Object.keys(state.goals).reduce((acc, goalId) => {
    const goal = state.goals[goalId];
    acc[goalId] = {
      ...goal,
      linkedHabits: goal.linkedHabits.filter(id => id !== habitId),
    };
    return acc;
  }, {} as { [goalId: string]: Goal });

  // Remove habit from all days
  const updatedDays = Object.keys(state.days).reduce((acc, dateKey) => {
    const day = state.days[dateKey];
    const { [habitId]: removedHabit, ...remainingDayHabits } = day.habits;
    acc[dateKey] = {
      ...day,
      habits: remainingDayHabits,
    };
    return acc;
  }, {} as { [dateKey: string]: Day });

  return {
    ...state,
    habits: remainingHabits,
    goals: updatedGoals,
    days: updatedDays,
  };
}

export function updateHabit(state: AppState, habitId: string, updates: Partial<Habit>): AppState {
  const habit = state.habits[habitId];
  if (!habit) return state;

  return {
    ...state,
    habits: {
      ...state.habits,
      [habitId]: {
        ...habit,
        ...updates,
        id: habitId, // Ensure id doesn't change
      },
    },
  };
}

// Goal CRUD Operations
export function createGoal(state: AppState, title: string, linkedHabits: string[] = [], deadline: string | null = null): AppState {
  const id = uuidv4();
  const newGoal: Goal = {
    id,
    title,
    linkedHabits,
    progress: 0,
    deadline,
  };

  return {
    ...state,
    goals: {
      ...state.goals,
      [id]: newGoal,
    },
  };
}

export function deleteGoal(state: AppState, goalId: string): AppState {
  const { [goalId]: removed, ...remainingGoals } = state.goals;

  return {
    ...state,
    goals: remainingGoals,
  };
}

export function updateGoal(state: AppState, goalId: string, updates: Partial<Goal>): AppState {
  const goal = state.goals[goalId];
  if (!goal) return state;

  return {
    ...state,
    goals: {
      ...state.goals,
      [goalId]: {
        ...goal,
        ...updates,
        id: goalId, // Ensure id doesn't change
      },
    },
  };
}

// Goal Progress Computation
export function computeGoalProgress(state: AppState, goalId: string): number {
  const goal = state.goals[goalId];
  if (!goal || goal.linkedHabits.length === 0) return 0;

  let totalCompletions = 0;
  let totalPossible = 0;

  goal.linkedHabits.forEach(habitId => {
    const habit = state.habits[habitId];
    if (habit) {
      const completions = Object.values(habit.history).filter(Boolean).length;
      totalCompletions += completions;

      // Calculate total possible based on habit history age
      const historyDates = Object.keys(habit.history);
      if (historyDates.length > 0) {
        totalPossible += historyDates.length;
      }
    }
  });

  if (totalPossible === 0) return 0;
  return Math.round((totalCompletions / totalPossible) * 100);
}

// Metrics Computation
export interface DashboardMetrics {
  avgMood: number | null;
  avgRating: number | null;
  totalJournalDays: number;
  journalConsistency: number; // percentage
  productivityScore: number; // percentage
  totalHabitsCompleted: number;
  totalTasksCompleted: number;
  currentBestStreak: { habitName: string; streak: number } | null;
}

export function computeMetrics(state: AppState, daysToConsider: number = 30): DashboardMetrics {
  const dateKeys = Object.keys(state.days).sort().reverse().slice(0, daysToConsider);

  if (dateKeys.length === 0) {
    return {
      avgMood: null,
      avgRating: null,
      totalJournalDays: 0,
      journalConsistency: 0,
      productivityScore: 0,
      totalHabitsCompleted: 0,
      totalTasksCompleted: 0,
      currentBestStreak: null,
    };
  }

  // Calculate averages
  const moods = dateKeys.map(key => state.days[key].mood).filter(m => m !== null) as number[];
  const ratings = dateKeys.map(key => state.days[key].rating).filter(r => r !== null) as number[];

  const avgMood = moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : null;
  const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

  // Journal consistency
  const journalDays = dateKeys.filter(key => state.days[key].journal.trim().length > 0).length;
  const journalConsistency = Math.round((journalDays / dateKeys.length) * 100);

  // Productivity score (habits + tasks)
  let totalHabitsCompleted = 0;
  let totalHabitsPossible = 0;
  let totalTasksCompleted = 0;
  let totalTasks = 0;

  dateKeys.forEach(dateKey => {
    const day = state.days[dateKey];

    // Count habits
    const dayHabitsCompleted = Object.values(day.habits).filter(Boolean).length;
    totalHabitsCompleted += dayHabitsCompleted;
    totalHabitsPossible += Object.keys(state.habits).length;

    // Count tasks
    totalTasks += day.tasks.length;
    totalTasksCompleted += day.tasks.filter(t => t.completed).length;
  });

  const habitCompletionRate = totalHabitsPossible > 0 ? totalHabitsCompleted / totalHabitsPossible : 0;
  const taskCompletionRate = totalTasks > 0 ? totalTasksCompleted / totalTasks : 0;
  const productivityScore = Math.round(((habitCompletionRate + taskCompletionRate) / 2) * 100);

  // Find best current streak
  const bestStreak = Object.values(state.habits).reduce<{ habitName: string; streak: number } | null>((acc, habit) => {
    if (!acc || habit.streak > acc.streak) {
      return { habitName: habit.name, streak: habit.streak };
    }
    return acc;
  }, null);

  return {
    avgMood,
    avgRating,
    totalJournalDays: journalDays,
    journalConsistency,
    productivityScore,
    totalHabitsCompleted,
    totalTasksCompleted,
    currentBestStreak: bestStreak && bestStreak.streak > 0 ? bestStreak : null,
  };
}

// Day Comparison
export interface DayComparison {
  moodDiff: number | null;
  ratingDiff: number | null;
  habitsDiff: number;
  tasksDiff: number;
  journalLengthDiff: number;
}

export function compareDays(state: AppState, dateA: string, dateB: string): DayComparison {
  const dayA = state.days[dateA];
  const dayB = state.days[dateB];

  if (!dayA || !dayB) {
    return {
      moodDiff: null,
      ratingDiff: null,
      habitsDiff: 0,
      tasksDiff: 0,
      journalLengthDiff: 0,
    };
  }

  const moodDiff = dayA.mood !== null && dayB.mood !== null ? dayA.mood - dayB.mood : null;
  const ratingDiff = dayA.rating !== null && dayB.rating !== null ? dayA.rating - dayB.rating : null;

  const habitsCompletedA = Object.values(dayA.habits).filter(Boolean).length;
  const habitsCompletedB = Object.values(dayB.habits).filter(Boolean).length;
  const habitsDiff = habitsCompletedA - habitsCompletedB;

  const tasksCompletedA = dayA.tasks.filter(t => t.completed).length;
  const tasksCompletedB = dayB.tasks.filter(t => t.completed).length;
  const tasksDiff = tasksCompletedA - tasksCompletedB;

  const journalLengthDiff = dayA.journal.length - dayB.journal.length;

  return {
    moodDiff,
    ratingDiff,
    habitsDiff,
    tasksDiff,
    journalLengthDiff,
  };
}

// Get date range for charts
export function getDateRange(endDate: string, days: number): string[] {
  const dates: string[] = [];
  let currentDate = endDate;

  for (let i = 0; i < days; i++) {
    dates.unshift(currentDate);
    currentDate = getPreviousDate(currentDate);
  }

  return dates;
}

// Calculate daily productivity score
export function getDayProductivityScore(state: AppState, dateKey: string): number {
  const day = state.days[dateKey];
  if (!day) return 0;

  const totalHabits = Object.keys(state.habits).length;
  const completedHabits = Object.values(day.habits).filter(Boolean).length;
  const habitScore = totalHabits > 0 ? completedHabits / totalHabits : 0;

  const totalTasks = day.tasks.length;
  const completedTasks = day.tasks.filter(t => t.completed).length;
  const taskScore = totalTasks > 0 ? completedTasks / totalTasks : 0;

  // Weight: 60% habits, 40% tasks
  return Math.round((habitScore * 0.6 + taskScore * 0.4) * 100);
}

