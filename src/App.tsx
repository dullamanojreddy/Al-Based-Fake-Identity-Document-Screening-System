import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MissionControlDashboard } from './components/MissionControlDashboard';
import { NewScreeningWorkstation } from './components/NewScreeningWorkstation';
import { ScreeningDetailView } from './components/ScreeningDetailView';
import { WatchlistDatabaseView } from './components/WatchlistDatabaseView';
import { SystemAnalyticsView } from './components/SystemAnalyticsView';
import { AuditLedgerView } from './components/AuditLedgerView';
import { SystemSettingsView } from './components/SystemSettingsView';
import { LiveWebcamModal } from './components/LiveWebcamModal';
import { Login } from './components/Login';
import { SAMPLE_SCREENING_CASES } from './data/sampleScreenings';
import { ScreeningSession } from './types';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'new_screening' | 'screenings' | 'watchlist' | 'reports' | 'audit' | 'settings'
  >('dashboard');

  const [currentSession, setCurrentSession] = useState<ScreeningSession>(SAMPLE_SCREENING_CASES[0]);
  const [allSessions, setAllSessions] = useState<ScreeningSession[]>(SAMPLE_SCREENING_CASES);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [liveCapturedFaceUrl, setLiveCapturedFaceUrl] = useState<string | undefined>(undefined);

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

  const handleCompleteNewScreening = (newSession: ScreeningSession) => {
    setAllSessions((prev) => [newSession, ...prev]);
    setCurrentSession(newSession);
    setActiveTab('screenings');
  };

  const handleFaceCaptured = (faceUrl: string) => {
    setLiveCapturedFaceUrl(faceUrl);
    if (activeTab === 'screenings') {
      const updatedBio = {
        ...currentSession.biometrics!,
        livePassengerFaceUrl: faceUrl,
        isBiometricVerified: true,
        similarityScore: 95.4,
        matchStatus: 'MATCH_VERIFIED' as const,
      };
      handleUpdateSession({ ...currentSession, biometrics: updatedBio });
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewScreening={() => setActiveTab('new_screening')}
        onLogout={handleLogout}
        operatorId="OPR-7742"
        clearanceLevel="Clearance Lvl 4"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        {/* Header */}
        <Header
          activeScreeningId={activeTab === 'screenings' ? currentSession.id : undefined}
          activeAlertsCount={allSessions.filter((s) => (s.risk?.overallRiskScore ?? 0) >= 26).length}
          integrityStatus="Operational"
          onRefresh={() => {}}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-8 py-6 bg-slate-50">
          <div className="max-w-[1400px] mx-auto">
            {activeTab === 'dashboard' && (
              <MissionControlDashboard
                sessions={allSessions}
                onSelectScreening={handleSelectSession}
                onNavigateToScreenings={() => setActiveTab('screenings')}
                onNewScreening={() => setActiveTab('new_screening')}
              />
            )}

            {activeTab === 'new_screening' && (
              <NewScreeningWorkstation
                onCompleteScreening={handleCompleteNewScreening}
                onCancel={() => setActiveTab('dashboard')}
                onOpenLiveCamera={() => setIsCameraModalOpen(true)}
                liveCapturedFaceUrl={liveCapturedFaceUrl}
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

      {/* Live Camera Modal */}
      <LiveWebcamModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCaptureFace={handleFaceCaptured}
      />
    </div>
  );
}

export default App;