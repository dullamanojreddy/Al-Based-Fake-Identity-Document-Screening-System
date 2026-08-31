import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MissionControlDashboard } from './components/MissionControlDashboard';
import { ScreeningDetailView } from './components/ScreeningDetailView';
import { WatchlistDatabaseView } from './components/WatchlistDatabaseView';
import { SystemAnalyticsView } from './components/SystemAnalyticsView';
import { AuditLedgerView } from './components/AuditLedgerView';
import { SystemSettingsView } from './components/SystemSettingsView';
import { Login } from './components/Login';
import { SAMPLE_SCREENING_CASES } from './data/sampleScreenings';
import { ScreeningSession } from './types';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'screenings' | 'watchlist' | 'reports' | 'audit' | 'settings'
  >('dashboard');

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
    setActiveTab('screenings');
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
    <div className="flex h-screen bg-[#070d18] text-slate-100 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewScreening={() => {
          setCurrentSession(SAMPLE_SCREENING_CASES[1]);
          setActiveTab('screenings');
        }}
        onLogout={handleLogout}
        operatorId="OPR-77A"
        clearanceLevel="Level 4 Clearance"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#070d18]">
        {/* Header */}
        <Header
          activeScreeningId={activeTab === 'screenings' ? currentSession.id : undefined}
          activeAlertsCount={3}
          integrityStatus="Verified"
          onRefresh={() => {}}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-8 py-6 bg-[#070d18]">
          <div className="max-w-[1400px] mx-auto">
            {activeTab === 'dashboard' && (
              <MissionControlDashboard
                onSelectScreening={handleSelectSession}
                onNavigateToScreenings={() => setActiveTab('screenings')}
              />
            )}

            {activeTab === 'screenings' && (
              <ScreeningDetailView
                currentSession={currentSession}
                onSelectSampleCase={handleSelectSession}
                onUpdateSession={handleUpdateSession}
              />
            )}

            {activeTab === 'watchlist' && <WatchlistDatabaseView />}

            {activeTab === 'reports' && (
              <SystemAnalyticsView
                sessions={allSessions}
                onSelectSession={handleSelectSession}
              />
            )}

            {activeTab === 'audit' && <AuditLedgerView />}

            {activeTab === 'settings' && <SystemSettingsView />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;