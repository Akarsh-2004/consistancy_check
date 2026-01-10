
import '../../styles/Navbar.css';

interface NavbarProps {
  setView: (view: string) => void;
  currentView: string; // Add currentView prop
}

export function Navbar({ setView, currentView }: NavbarProps) {
  return (
    <nav>
      <button 
        onClick={() => setView('daily')} 
        className={currentView === 'daily' ? 'active' : ''}
      >Daily</button>
      <button 
        onClick={() => setView('dashboard')} 
        className={currentView === 'dashboard' ? 'active' : ''}
      >Dashboard</button>
      <button 
        onClick={() => setView('goals')} 
        className={currentView === 'goals' ? 'active' : ''}
      >Goals</button>
      <button 
        onClick={() => setView('journal')} 
        className={currentView === 'journal' ? 'active' : ''}
      >Journal</button>
      <button 
        onClick={() => setView('calendar')} 
        className={currentView === 'calendar' ? 'active' : ''}
      >Calendar</button>
    </nav>
  );
}
