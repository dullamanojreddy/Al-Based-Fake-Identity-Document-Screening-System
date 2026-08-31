import React, { useState } from 'react';
import { 
  Upload, 
  Camera, 
  FileCheck, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Layers, 
  Scan, 
  Shield, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { ScreeningSession, DocumentType } from '../types';
import { SAMPLE_SCREENING_CASES } from '../data/sampleScreenings';
import { ForensicImageViewer } from './ForensicImageViewer';
import { RiskScoreCard } from './RiskScoreCard';
import { MRZVerificationCard } from './MRZVerificationCard';
import { TamperDetectionCard } from './TamperDetectionCard';
import { BiometricVerificationCard } from './BiometricVerificationCard';
import { ExtractedFieldsTable } from './ExtractedFieldsTable';
import { WatchlistAlertCard } from './WatchlistAlertCard';
import { LiveWebcamModal } from './LiveWebcamModal';
import { OfficialDossierModal } from './OfficialDossierModal';

interface ScreeningWorkbenchProps {
  currentSession: ScreeningSession;
  onSelectSampleCase: (session: ScreeningSession) => void;
  onUpdateSession: (updated: ScreeningSession) => void;
}

export const ScreeningWorkbench: React.FC<ScreeningWorkbenchProps> = ({
  currentSession,
  onSelectSampleCase,
  onUpdateSession,
}) => {
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'ocr' | 'mrz' | 'tamper' | 'bio'>('tamper');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Custom file upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setIsAnalyzing(true);

      setTimeout(() => {
        // Build new screening session with uploaded image
        const newSession: ScreeningSession = {
          ...currentSession,
          id: `SSB-SCAN-${Date.now().toString().slice(-4)}`,
          documentImageUrl: dataUrl,
          travelerName: file.name.replace(/\.[^/.]+$/, '').toUpperCase(),
          timestamp: new Date().toISOString(),
          status: 'PENDING',
        };
        onUpdateSession(newSession);
        setIsAnalyzing(false);
      }, 1200);
    };
    reader.readAsDataURL(file);
  };

  const handleCaptureLiveFace = (liveFaceUrl: string) => {
    const updatedBio = {
      ...currentSession.biometrics!,
      livePassengerFaceUrl: liveFaceUrl,
      isBiometricVerified: true,
      similarityScore: 94.6,
      matchStatus: 'MATCH_VERIFIED' as const,
      details: 'Live passenger face captured and verified at checkpoint station. Biometric confidence 94.6%.',
    };

    onUpdateSession({
      ...currentSession,
      biometrics: updatedBio,
    });
  };

  const handleClearGate = () => {
    onUpdateSession({
      ...currentSession,
      status: 'CLEARED',
    });
  };

  const handleFlagSecondary = () => {
    onUpdateSession({
      ...currentSession,
      status: 'SECONDARY_INSPECTION',
    });
  };

  const handleDetainSubject = () => {
    onUpdateSession({
      ...currentSession,
      status: 'DETAINED',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Test Case Quick Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Interactive Test Scenarios (1-Click Evaluation):
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Select any real-world border forgery scenario or upload your own document:
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {SAMPLE_SCREENING_CASES.map((sample, idx) => {
            const isSelected = currentSession.id === sample.id;
            const isClear = sample.risk.riskTier === 'CLEAR';
            const isHigh = sample.risk.riskTier === 'DETAIN_ALERT';

            return (
              <button
                key={sample.id}
                onClick={() => onSelectSampleCase(sample)}
                className={`p-3 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      CASE #{idx + 1}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                        isClear
                          ? 'bg-emerald-950 text-emerald-400'
                          : 'bg-red-950 text-red-400'
                      }`}
                    >
                      {sample.risk.riskTier === 'CLEAR' ? '0% RISK' : `${sample.risk.overallRiskScore}% RISK`}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">
                    {sample.travelerName}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {sample.documentType.toUpperCase()} ({sample.travelerNationality})
                  </p>
                </div>

                <div className="mt-2 text-[10px] font-semibold text-cyan-300 flex items-center gap-1">
                  <span>
                    {idx === 0 && 'Genuine Passport'}
                    {idx === 1 && 'Photo Replaced Permit'}
                    {idx === 2 && 'Altered DOB (MRZ Fail)'}
                    {idx === 3 && 'Forged Visa Stamp'}
                    {idx === 4 && 'Interpol Red Notice'}
                  </span>
                  <ChevronRight className="w-3 h-3 ml-auto" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Upload & Live Camera Options */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold cursor-pointer border border-slate-700 transition flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              Upload Travel Document
              <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={() => setIsCameraModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold border border-slate-700 transition flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              Open Live Checkpoint Camera
            </button>
          </div>

          <div className="text-slate-400 font-mono text-[11px]">
            Inspecting Station: <strong className="text-white">{currentSession.checkpointId}</strong> | Officer: <strong className="text-white">{currentSession.officerName} ({currentSession.officerBadge})</strong>
          </div>
        </div>
      </div>

      {/* Main Dual-Pane Forensic Workplace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Forensic Image Inspector (Original, ELA, Noise, OCR Overlay) */}
        <div className="lg:col-span-7 space-y-4">
          <ForensicImageViewer
            documentImageUrl={currentSession.documentImageUrl}
            tamperBoxes={currentSession.tampering.tamperBoxes}
            fields={currentSession.fields}
            isTampered={currentSession.tampering.isTampered}
          />
        </div>

        {/* Right 5 Columns: Composite Risk Assessment & Watchlist Alert */}
        <div className="lg:col-span-5 space-y-4">
          <RiskScoreCard
            risk={currentSession.risk}
            onClearDocument={handleClearGate}
            onFlagSecondary={handleFlagSecondary}
            onDetainSubject={handleDetainSubject}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />

          <WatchlistAlertCard watchlist={currentSession.watchlist} />
        </div>
      </div>

      {/* Bottom Forensic Detailed Modules (Tabbed) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Module Tab Selector */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveDetailTab('tamper')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeDetailTab === 'tamper'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Module 3: Tampering Forensics (Core AI)
            {currentSession.tampering.isTampered && (
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveDetailTab('mrz')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeDetailTab === 'mrz'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            Module 2: ICAO 9303 MRZ Engine
          </button>

          <button
            onClick={() => setActiveDetailTab('bio')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeDetailTab === 'bio'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Module 4: 1:1 Facial Biometrics
          </button>

          <button
            onClick={() => setActiveDetailTab('ocr')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeDetailTab === 'ocr'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Module 1: OCR Data Fields
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="p-5">
          {activeDetailTab === 'tamper' && (
            <TamperDetectionCard tampering={currentSession.tampering} />
          )}

          {activeDetailTab === 'mrz' && (
            <MRZVerificationCard mrzData={currentSession.mrzData} />
          )}

          {activeDetailTab === 'bio' && (
            <BiometricVerificationCard
              biometrics={currentSession.biometrics}
              onOpenLiveCamera={() => setIsCameraModalOpen(true)}
            />
          )}

          {activeDetailTab === 'ocr' && (
            <ExtractedFieldsTable fields={currentSession.fields} />
          )}
        </div>
      </div>

      {/* Live Camera Modal */}
      <LiveWebcamModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCaptureFace={handleCaptureLiveFace}
      />

      {/* Official PDF Report Dossier Modal */}
      <OfficialDossierModal
        session={currentSession}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};
