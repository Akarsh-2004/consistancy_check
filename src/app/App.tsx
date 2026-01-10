import { useState, useEffect } from 'react';
import { Today } from './pages/Today';
import { Dashboard } from './pages/Dashboard';
import { Goals } from './pages/Goals';
// import { JournalPage } from './pages/JournalPage';
import { Calendar } from './pages/Calendar';
import { Settings } from './pages/Settings'; // New import
import { MainLayout } from './layouts/MainLayout';
import './styles/App.css';
import { AppState, persistState, getTodayKey, ensureDay } from './lib/state';

interface AppProps {
  initialState: AppState;
}

function App({ initialState }: AppProps) {
  const [appState, setAppState] = useState<AppState>(initialState);
  const [view, setView] = useState('today'); // Default to 'today'

  useEffect(() => {
    persistState(appState);
  }, [appState]);

  // Ensure today's day exists in the state
  useEffect(() => {
    const todayKey = getTodayKey();
    setAppState(prevState => {
      const newState = ensureDay(prevState, todayKey);
      if (newState !== prevState) {
        return newState;
      }
      return prevState;
    });
  }, []); // Run only once on mount

  const updateAppState = (updater: (prevState: AppState) => AppState) => {
    setAppState(updater);
  };

  return (
    <MainLayout setView={setView} currentView={view} appState={appState}>
      {view === 'today' && <Today appState={appState} updateAppState={updateAppState} />}
      {view === 'dashboard' && <Dashboard appState={appState} />}
      {view === 'goals' && <Goals appState={appState} updateAppState={updateAppState} />}
      {/* view === 'journal' && <JournalPage appState={appState} /> */}
      {view === 'calendar' && <Calendar appState={appState} />}
      {view === 'settings' && <Settings appState={appState} updateAppState={updateAppState} />}
    </MainLayout>
  );
}

export default App;
