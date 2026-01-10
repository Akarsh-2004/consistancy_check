import React from 'react';
import { Sidebar } from '../components/Sidebar/Sidebar'; // Import Sidebar
import '../styles/App.css'; // Global app styling
import { AppState } from '../lib/state';

interface MainLayoutProps {
  children: React.ReactNode;
  setView: (view: string) => void;
  currentView: string;
  appState?: AppState;
}

const QUOTES = [
  { text: "The quality of your life is the quality of your habits.", author: "James Clear" },
  { text: "Order your soul. Reduce your wants.", author: "Augustine" },
  { text: "The first and greatest victory is to conquer oneself.", author: "Plato" },
  { text: "Waste no more time arguing what a good man should be. Be one.", author: "Marcus Aurelius" },
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant" },
];

export function MainLayout({ children, setView, currentView, appState }: MainLayoutProps) {
  // Simple deterministic quote selection
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const quote = QUOTES[dayOfYear % QUOTES.length];

  return (
    <div className="app-container">
      <Sidebar setView={setView} currentView={currentView} appState={appState} />
      <div className="main-content-area">
        <header className="app-header">
          <h1>{currentView.charAt(0).toUpperCase() + currentView.slice(1)}</h1>
          <div className="daily-quote">
            <p className="quote-text">"{quote.text}"</p>
            <p className="quote-author">— {quote.author}</p>
          </div>
        </header>
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}