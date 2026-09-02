import React, { useRef, useState } from 'react';
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
import { INITIAL_WATCHLIST, WatchlistEntry } from './data/watchlistEntries';
import { createAuditBlock, getInitialAuditLedger } from './utils/auditLedger';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'new_screening' | 'screenings' | 'watchlist' | 'reports' | 'audit' | 'settings'
  >('dashboard');

  const [currentSession, setCurrentSession] = useState<ScreeningSession>(SAMPLE_SCREENING_CASES[0]);
  const [allSessions, setAllSessions] = useState<ScreeningSession[]>(SAMPLE_SCREENING_CASES);
  const [watchlistEntries, setWatchlistEntries] = useState<WatchlistEntry[]>(INITIAL_WATCHLIST);
  const [auditLedger, setAuditLedger] = useState(() => getInitialAuditLedger());
  const reviewScreeningIds = useRef(new Set<string>());
  const approvedScreeningIds = useRef(new Set<string>());
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

  const isKnownValue = (value?: string) => Boolean(value && !/^(unknown|not detected|not available|n\/a)$/i.test(value.trim()));
  const extractedValue = (session: ScreeningSession, labels: RegExp, fallback: string) =>
    session.fields.find((field) => labels.test(`${field.key} ${field.label}`) && isKnownValue(field.value))?.value ||
    (isKnownValue(fallback) ? fallback : 'UNKNOWN');
  const withOfficerNotes = (session: ScreeningSession, officerNotes: string, finalDecision: 'CLEARED' | 'SECONDARY_INSPECTION') => ({
    ...session,
    risk: session.risk ? {
      ...session.risk,
      officerReview: {
        confirmedFindingIds: session.risk.officerReview?.confirmedFindingIds || [],
        dismissedFindingIds: session.risk.officerReview?.dismissedFindingIds || [],
        officerNotes,
        secondaryInspectionRequested: finalDecision === 'SECONDARY_INSPECTION',
        finalDecision,
        reviewedAt: new Date().toISOString(),
        officerBadge: session.officerBadge,
        officerName: session.officerName,
      },
    } : session.risk,
  });

  const handleSendForReview = (session: ScreeningSession, officerNotes: string) => {
    const alreadyUnderReview = reviewScreeningIds.current.has(session.id) || watchlistEntries.some((entry) => entry.sourceCaseId === session.id);
    if (!alreadyUnderReview) {
      reviewScreeningIds.current.add(session.id);
      const name = extractedValue(session, /name/i, session.travelerName);
      const documentNumber = extractedValue(session, /(passport|document|id).*number|number.*(passport|document|id)/i, session.travelerPassportNumber);
      const dob = extractedValue(session, /birth|dob/i, session.travelerDob);
      setWatchlistEntries((entries) => entries.some((entry) => entry.sourceCaseId === session.id) ? entries : [{
        id: `WL-REVIEW-${session.id}`,
        name,
        aliases: [],
        nationality: extractedValue(session, /nationality/i, session.travelerNationality),
        dob,
        passportNum: documentNumber,
        noticeType: 'ENHANCED_REVIEW',
        category: 'Officer Review',
        issuedDate: new Date().toISOString().slice(0, 10),
        status: 'PENDING_REVIEW',
        summary: officerNotes.trim() || 'Sent for manual officer review.',
        sourceCaseId: session.id,
        riskScore: session.risk?.overallRiskScore,
      }, ...entries]);
    }
    handleUpdateSession({ ...withOfficerNotes(session, officerNotes, 'SECONDARY_INSPECTION'), status: 'SECONDARY_INSPECTION' });
    return !alreadyUnderReview;
  };

  const handleApproveAndRelease = (session: ScreeningSession, officerNotes: string) => {
    if (session.decisionState === 'APPROVE_AND_RELEASE' || approvedScreeningIds.current.has(session.id)) return false;
    approvedScreeningIds.current.add(session.id);
    const documentNumber = extractedValue(session, /(passport|document|id).*number|number.*(passport|document|id)/i, session.travelerPassportNumber);
    const updated = { ...withOfficerNotes(session, officerNotes, 'CLEARED'), status: 'CLEARED' as const, decisionState: 'APPROVE_AND_RELEASE' };
    handleUpdateSession(updated);
    setAuditLedger((ledger) => [...ledger, createAuditBlock(
      ledger,
      session.officerBadge,
      'APPROVE_AND_RELEASE',
      'OFFICER_REVIEW',
      session.id,
      {
        screeningId: session.id,
        documentType: session.documentType,
        documentNumber,
        officerName: session.officerName,
        decision: 'CLEARED',
        reviewPriority: session.risk?.reviewPriority || 'NOT AVAILABLE',
        riskScore: session.risk?.overallRiskScore ?? 'NOT AVAILABLE',
        officerNotes: officerNotes.trim() || 'NOT AVAILABLE',
      }
    )]);
    return true;
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
                onSendForReview={handleSendForReview}
                onApproveAndRelease={handleApproveAndRelease}
                isUnderReview={watchlistEntries.some((entry) => entry.sourceCaseId === currentSession.id)}
              />
            )}

            {activeTab === 'watchlist' && <WatchlistDatabaseView watchlist={watchlistEntries} onUpdateWatchlist={setWatchlistEntries} />}

            {activeTab === 'reports' && (
              <SystemAnalyticsView
                sessions={allSessions}
                onSelectSession={handleSelectSession}
              />
            )}

            {activeTab === 'audit' && <AuditLedgerView ledger={auditLedger} />}

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
