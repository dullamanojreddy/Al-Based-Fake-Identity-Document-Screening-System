import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, MainTab } from './components/Sidebar';
import { Login } from './components/Login';
import { ScreeningWorkbench } from './components/ScreeningWorkbench';
import { IntelligenceDashboard } from './components/IntelligenceDashboard';
import { WatchlistDatabaseView } from './components/WatchlistDatabaseView';
import { SystemSettingsView } from './components/SystemSettingsView';
import { ScreeningSession } from './types';
import { SAMPLE_SCREENING_CASES } from './data/sampleScreenings';

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('auth_token') !== null;
  });

  const [activeTab, setActiveTab] = useState<MainTab>('screening');
  const [currentSession, setCurrentSession] = useState<ScreeningSession>(SAMPLE_SCREENING_CASES[0]);
  const [auditSessions, setAuditSessions] = useState<ScreeningSession[]>(() => {
    try {
      const saved = localStorage.getItem('ssb_screening_cases_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load saved cases:', e);
    }
    return SAMPLE_SCREENING_CASES;
  });

  useEffect(() => {
    localStorage.setItem('ssb_screening_cases_v2', JSON.stringify(auditSessions));
  }, [auditSessions]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setIsAuthenticated(false);
  };

  const handleSelectSampleCase = (sample: ScreeningSession) => {
    setCurrentSession(sample);
  };

  const handleUpdateSession = (updated: ScreeningSession) => {
    setCurrentSession(updated);
    setAuditSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === updated.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [updated, ...prev];
    });
  };

  const handleSelectRecordFromAudit = (record: ScreeningSession) => {
    setCurrentSession(record);
    setActiveTab('screening');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Border Terminal Header */}
      <Header
        onLogout={handleLogout}
        checkpointName={currentSession.checkpointName}
        officerBadge={currentSession.officerBadge}
        officerName={currentSession.officerName}
      />

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex min-w-0">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {activeTab === 'screening' && (
            <ScreeningWorkbench
              currentSession={currentSession}
              onSelectSampleCase={handleSelectSampleCase}
              onUpdateSession={handleUpdateSession}
            />
          )}

          {activeTab === 'intelligence' && (
            <IntelligenceDashboard
              records={auditSessions}
              onSelectRecord={handleSelectRecordFromAudit}
            />
          )}

          {activeTab === 'watchlist' && <WatchlistDatabaseView />}

          {activeTab === 'settings' && <SystemSettingsView />}
        </main>
      </div>
    </div>
  );
}