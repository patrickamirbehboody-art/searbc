import { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import RosterBuilder from './components/RosterBuilder';
import { ToastContainer } from './components/Toast';

export default function App() {
  const [authed, setAuthed] = useState(false);

  return (
    <div className="app">
      {!authed ? (
        <LoginScreen onLogin={() => setAuthed(true)} />
      ) : (
        <>
          <header className="topbar">
            <div className="topbar-brand">
              <div className="topbar-logo">RBC</div>
              <div>
                <div className="topbar-title">ROSTER BUILDER</div>
                <div className="topbar-subtitle">SEA-RBC Production · Des Moines, WA</div>
              </div>
            </div>
            <div className="topbar-right">
              <span><span className="status-dot" />Connected to Airtable</span>
              <button
                className="btn btn-ghost"
                style={{ fontSize: 11 }}
                onClick={() => setAuthed(false)}
              >
                Disconnect
              </button>
            </div>
          </header>
          <RosterBuilder />
        </>
      )}
      <ToastContainer />
    </div>
  );
}
