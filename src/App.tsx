import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ScreeningWorkbench } from './components/ScreeningWorkbench';
import { IntelligenceDashboard } from './components/IntelligenceDashboard';
import { WatchlistDatabaseView } from './components/WatchlistDatabaseView';
import { AuditLedgerView } from './components/AuditLedgerView';
import { ModelRegistryView } from './components/ModelRegistryView';
import { SystemSettingsView } from './components/SystemSettingsView';
import { Login } from './components/Login';
import { SAMPLE_SCREENING_CASES } from './data/sampleScreenings';
import { ScreeningSession } from './types';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    'screening' | 'intelligence' | 'watchlist' | 'audit' | 'models' | 'settings'
  >('screening');

  const [currentSession, setCurrentSession] = useState<ScreeningSession>(SAMPLE_SCREENING_CASES[0]);
  const [allSessions, setAllSessions] = useState<ScreeningSession[]>(SAMPLE_SCREENING_CASES);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleSelectSession = (session: ScreeningSession) => {
    setCurrentSession(session);
    setActiveTab('screening');
  };

  const handleUpdateSession = (updated: ScreeningSession) => {
    setCurrentSession(updated);
    setAllSessions((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeScreeningsCount={allSessions.length}
      />

      {/* Main Terminal Body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          officerBadge={currentSession.officerBadge}
          officerName={currentSession.officerName}
          checkpointName={currentSession.checkpointName}
          activeAlertsCount={1}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'screening' && (
              <ScreeningWorkbench
                currentSession={currentSession}
                onSelectSampleCase={handleSelectSession}
                onUpdateSession={handleUpdateSession}
              />
            )}

            {activeTab === 'intelligence' && (
              <IntelligenceDashboard
                sessions={allSessions}
                onSelectSession={handleSelectSession}
              />
            )}

            {activeTab === 'watchlist' && <WatchlistDatabaseView />}

            {activeTab === 'audit' && <AuditLedgerView />}

            {activeTab === 'models' && <ModelRegistryView />}

            {activeTab === 'settings' && <SystemSettingsView />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;