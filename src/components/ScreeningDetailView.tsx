import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  Camera, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Layers, 
  Sparkles, 
  Plus, 
  RotateCcw, 
  ChevronRight, 
  Maximize2,
  Flag,
  Lock,
  FileWarning,
  Sliders,
  Download,
  Printer,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';
import { ScreeningSession, OfficerReviewRecord } from '../types';
import { SAMPLE_SCREENING_CASES } from '../data/sampleScreenings';
import { LiveWebcamModal } from './LiveWebcamModal';
import { OfficialDossierModal } from './OfficialDossierModal';
import { MRZVerificationCard } from './MRZVerificationCard';
import { TamperDetectionCard } from './TamperDetectionCard';
import { BiometricVerificationCard } from './BiometricVerificationCard';
import { ExtractedFieldsTable } from './ExtractedFieldsTable';

interface ScreeningDetailViewProps {
  currentSession: ScreeningSession;
  onSelectSampleCase: (session: ScreeningSession) => void;
  onUpdateSession: (updated: ScreeningSession) => void;
}

export const ScreeningDetailView: React.FC<ScreeningDetailViewProps> = ({
  currentSession,
  onSelectSampleCase,
  onUpdateSession,
}) => {
  const [activeOverlay, setActiveOverlay] = useState<'original' | 'forensic' | 'ela' | 'noise'>('forensic');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [showNoteModal, setShowNoteModal] = useState<boolean>(false);
  const [investigatorNote, setInvestigatorNote] = useState<string>(
    currentSession.risk.officerReview?.officerNotes || ''
  );
  const [activeDrawerTab, setActiveDrawerTab] = useState<'none' | 'mrz' | 'tamper' | 'bio' | 'ocr'>('none');

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

  const handleClear = () => {
    onUpdateSession({ ...currentSession, status: 'CLEARED' });
  };

  const handleFlag = () => {
    onUpdateSession({ ...currentSession, status: 'SECONDARY_INSPECTION' });
  };

  const handleEscalate = () => {
    onUpdateSession({ ...currentSession, status: 'DETAINED' });
  };

  const handleSaveNote = () => {
    const updatedReview: OfficerReviewRecord = {
      confirmedFindingIds: currentSession.risk.findings.map(f => f.id),
      dismissedFindingIds: [],
      officerNotes: investigatorNote,
      secondaryInspectionRequested: currentSession.status === 'SECONDARY_INSPECTION',
      finalDecision: currentSession.status === 'PENDING' ? 'SECONDARY_INSPECTION' : currentSession.status,
      reviewedAt: new Date().toISOString(),
      officerBadge: currentSession.officerBadge,
      officerName: currentSession.officerName,
    };
    onUpdateSession({
      ...currentSession,
      risk: { ...currentSession.risk, officerReview: updatedReview }
    });
    setShowNoteModal(false);
  };

  const riskScore = currentSession.risk.overallRiskScore;
  const isHighRisk = riskScore >= 66;
  const isMediumRisk = riskScore >= 26 && riskScore < 66;

  return (
    <div className="space-y-6 pb-20 text-slate-200">
      {/* Test Scenarios Quick Bar */}
      <div className="bg-[#0b1424] border border-[#182740] rounded-xl p-3.5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Active Screening Dossier:
          </span>
          <span className="text-xs font-mono text-cyan-300 font-bold">
            {currentSession.id}
          </span>
        </div>

        {/* Quick Case Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {SAMPLE_SCREENING_CASES.slice(0, 4).map((caseItem, idx) => {
            const isSelected = caseItem.id === currentSession.id;
            return (
              <button
                key={caseItem.id}
                onClick={() => onSelectSampleCase(caseItem)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#182a47] text-white border border-cyan-400/80 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'bg-[#0e192c] text-slate-400 hover:text-white border border-[#1b2b46]'
                }`}
              >
                <span>Case #{idx + 1}: {caseItem.travelerName.split(' ')[0]}</span>
                <span className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                  caseItem.risk.overallRiskScore > 65 ? 'bg-red-950 text-red-400' : 'bg-emerald-950 text-emerald-400'
                }`}>
                  {caseItem.risk.overallRiskScore}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Pane Inspection Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Columns: DOCUMENT INSPECTION CANVAS */}
        <div className="lg:col-span-7 bg-[#0b1424] border border-[#182740] rounded-xl overflow-hidden shadow-xl">
          {/* Canvas Toolbar */}
          <div className="px-5 py-3.5 border-b border-[#182740] flex items-center justify-between bg-[#08101d]">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                DOCUMENT INSPECTION
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {/* Overlay Toggle Pill */}
              <div className="flex items-center bg-[#0d1728] p-0.5 rounded-md border border-[#1b2c47]">
                <button
                  onClick={() => setActiveOverlay('original')}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded transition ${
                    activeOverlay === 'original'
                      ? 'bg-[#182a47] text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ORIGINAL
                </button>
                <button
                  onClick={() => setActiveOverlay('forensic')}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded transition flex items-center gap-1.5 ${
                    activeOverlay === 'forensic'
                      ? 'bg-[#b45309] text-white shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                      : 'text-[#f59e0b] hover:text-white'
                  }`}
                >
                  <ShieldAlert className="w-3 h-3 text-[#fde047]" />
                  FORENSIC OVERLAY
                </button>
                <button
                  onClick={() => setActiveOverlay('ela')}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded transition ${
                    activeOverlay === 'ela'
                      ? 'bg-[#9333ea] text-white'
                      : 'text-slate-400 hover:text-purple-300'
                  }`}
                >
                  ELA HEATMAP
                </button>
              </div>

              {/* Zoom In/Out */}
              <button
                onClick={() => setZoomLevel((prev) => (prev === 1 ? 1.3 : 1))}
                className="p-1.5 text-slate-400 hover:text-white bg-[#0d1728] border border-[#1b2c47] rounded-md transition"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Blueprint Lightbox Viewport */}
          <div className="relative min-h-[460px] bg-[#070e1a] flex items-center justify-center p-6 overflow-hidden">
            {/* Blueprint Background Grid Lines */}
            <div 
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
              }}
            />

            {/* Document Image Container with Glowing Lightbox Effect */}
            <div 
              className="relative transition-transform duration-300 select-none shadow-[0_0_35px_rgba(56,189,248,0.15)] rounded-lg overflow-hidden border border-[#223554]"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {/* Document Image */}
              <img
                src={currentSession.documentImageUrl}
                alt="Document Inspection"
                className={`max-h-[380px] w-auto object-contain block ${
                  activeOverlay === 'ela' ? 'brightness-125 contrast-200 hue-rotate-60' : ''
                }`}
              />

              {/* Overlaid Anomaly Bounding Boxes in Forensic Mode */}
              {activeOverlay !== 'original' && (
                <>
                  {/* Spliced / Texture Anomaly on Portrait Photo */}
                  <div className="absolute left-[5.5%] top-[20%] w-[21%] h-[40%] border-2 border-dashed border-[#f59e0b] bg-[#f59e0b]/10 rounded flex flex-col justify-between pointer-events-none animate-in fade-in">
                    {/* 68-Facial Landmark Mesh Overlay */}
                    <svg className="w-full h-full opacity-60">
                      <circle cx="35%" cy="30%" r="2" fill="#38bdf8" />
                      <circle cx="65%" cy="30%" r="2" fill="#38bdf8" />
                      <circle cx="50%" cy="45%" r="2" fill="#38bdf8" />
                      <circle cx="40%" cy="65%" r="2" fill="#38bdf8" />
                      <circle cx="60%" cy="65%" r="2" fill="#38bdf8" />
                      <path d="M 25,60 Q 50,75 75,60" fill="none" stroke="#38bdf8" strokeWidth="1" />
                    </svg>

                    <div className="bg-[#0b1424]/90 border-t border-[#f59e0b] px-1.5 py-0.5 text-[8px] font-mono font-bold text-[#fbbf24] uppercase tracking-wider text-center">
                      TEXTURE ANOMALY DETECTED
                    </div>
                  </div>

                  {/* DOB / Text Mismatch Box */}
                  <div className="absolute left-[30%] top-[28%] w-[26%] h-[11%] border-2 border-[#f87171] bg-[#ef4444]/15 rounded flex items-center justify-center pointer-events-none animate-pulse">
                    <span className="bg-[#3b1219] border border-[#f87171] text-[#fca5a5] px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow">
                      <AlertTriangle className="w-2.5 h-2.5 text-[#f87171]" />
                      DOB MISMATCH
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: DEEP FORENSIC INTELLIGENCE PANELS */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card 1: EVIDENCE SUMMARY */}
          <div className="bg-[#0b1424] border border-[#182740] rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#182740] pb-3 mb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                EVIDENCE SUMMARY
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                isHighRisk 
                  ? 'bg-[#3b1219] text-[#fca5a5] border border-[#882233]' 
                  : isMediumRisk
                  ? 'bg-[#291e11] text-[#fbbf24] border border-[#784d12]'
                  : 'bg-[#112419] text-[#6ee7b7] border border-[#1d5236]'
              }`}>
                RISK: {isHighRisk ? 'HIGH' : isMediumRisk ? 'REVIEW' : 'LOW'}
              </span>
            </div>

            <div className="space-y-2.5">
              {/* DOB Mismatch Alert */}
              <div className="bg-[#121c2e] border-l-2 border-[#f87171] p-3 rounded-r-lg">
                <div className="flex items-center gap-1.5 text-[#f87171] font-mono font-bold text-xs mb-1">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>DOB MISMATCH</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  Visual OCR date (1985-04-12) conflicts with MRZ encoded date (1985-04-21). Potential tampering detected in visual zone.
                </p>
              </div>

              {/* Texture Anomaly Alert */}
              <div className="bg-[#121c2e] border-l-2 border-[#f59e0b] p-3 rounded-r-lg">
                <div className="flex items-center gap-1.5 text-[#f59e0b] font-mono font-bold text-xs mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>TEXTURE ANOMALY</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  Irregular UV reflectance over portrait area. Indicates possible photo substitution.
                </p>
              </div>

              {/* Face Match Alert */}
              <div className="bg-[#121c2e] border-l-2 border-cyan-400 p-3 rounded-r-lg">
                <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-bold text-xs mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>FACE MATCH</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  Live capture aligns with document portrait (91% match confidence).
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: BIOMETRIC VERIFICATION */}
          <div className="bg-[#0b1424] border border-[#182740] rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#182740] pb-2.5 mb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                BIOMETRIC VERIFICATION
              </h3>
              <span className="text-xs font-mono text-slate-300">
                CONFIDENCE: <strong className="text-white">91%</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              {/* Document Photo */}
              <div className="bg-[#070e1a] border border-[#15233a] rounded-lg p-2 flex flex-col items-center">
                <div className="w-24 h-28 bg-slate-800 rounded overflow-hidden mb-1.5 border border-slate-700 relative">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
                    alt="Document Portrait"
                    className="w-full h-full object-cover grayscale contrast-125"
                  />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                  DOCUMENT
                </span>
              </div>

              {/* Live Capture with Facial Landmark Overlay */}
              <div className="bg-[#070e1a] border border-[#15233a] rounded-lg p-2 flex flex-col items-center relative group">
                <div className="w-24 h-28 bg-slate-800 rounded overflow-hidden mb-1.5 border border-cyan-500/60 relative">
                  <img
                    src={currentSession.biometrics?.livePassengerFaceUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"}
                    alt="Live Passenger"
                    className="w-full h-full object-cover brightness-95"
                  />
                  {/* Landmark overlay dots */}
                  <div className="absolute inset-0 bg-cyan-500/10 pointer-events-none" />
                </div>
                <button
                  onClick={() => setIsCameraModalOpen(true)}
                  className="text-[10px] font-mono font-bold uppercase text-cyan-300 hover:text-white flex items-center gap-1 transition"
                >
                  <Camera className="w-2.5 h-2.5" />
                  LIVE CAPTURE
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: EXTRACTED DATA COMPARISON */}
          <div className="bg-[#0b1424] border border-[#182740] rounded-xl p-4 shadow-xl">
            <div className="border-b border-[#182740] pb-2.5 mb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                EXTRACTED DATA COMPARISON
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#070e1a] text-slate-400 font-mono text-[9px] uppercase border-b border-[#182740]">
                  <tr>
                    <th className="py-2 px-2.5">FIELD</th>
                    <th className="py-2 px-2.5">VISUAL OCR</th>
                    <th className="py-2 px-2.5">MRZ DATA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#15233a] font-mono text-[11px]">
                  <tr>
                    <td className="py-2 px-2.5 text-slate-400">Document No.</td>
                    <td className="py-2 px-2.5 font-bold text-white">X928471A</td>
                    <td className="py-2 px-2.5 font-bold text-white">X928471A</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2.5 text-slate-400">Last Name</td>
                    <td className="py-2 px-2.5 font-bold text-white">SMITH</td>
                    <td className="py-2 px-2.5 font-bold text-white">SMITH</td>
                  </tr>
                  <tr className="bg-[#3b1219]/40">
                    <td className="py-2 px-2.5 text-[#f87171] font-bold">Date of Birth</td>
                    <td className="py-2 px-2.5 font-bold text-[#fca5a5]">14 MAY 1988</td>
                    <td className="py-2 px-2.5 font-bold text-[#fca5a5]">21 APR 1985</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2.5 text-slate-400">Nationality</td>
                    <td className="py-2 px-2.5 font-bold text-white">GBR</td>
                    <td className="py-2 px-2.5 font-bold text-white">GBR</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Extra Feature Tabs (MRZ Checksums, Tampering Forensics, OCR Details) */}
      <div className="bg-[#0b1424] border border-[#182740] rounded-xl overflow-hidden shadow-xl">
        <div className="bg-[#08101d] px-4 py-2.5 border-b border-[#182740] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">
              Deep Diagnostic Modules:
            </span>
            <button
              onClick={() => setActiveDrawerTab(activeDrawerTab === 'mrz' ? 'none' : 'mrz')}
              className={`px-3 py-1 text-xs font-mono font-bold rounded transition ${
                activeDrawerTab === 'mrz' ? 'bg-cyan-600 text-white' : 'bg-[#121f35] text-slate-300 hover:text-white'
              }`}
            >
              ICAO MRZ Checksums
            </button>
            <button
              onClick={() => setActiveDrawerTab(activeDrawerTab === 'tamper' ? 'none' : 'tamper')}
              className={`px-3 py-1 text-xs font-mono font-bold rounded transition ${
                activeDrawerTab === 'tamper' ? 'bg-purple-600 text-white' : 'bg-[#121f35] text-slate-300 hover:text-white'
              }`}
            >
              Tamper Forensics
            </button>
            <button
              onClick={() => setActiveDrawerTab(activeDrawerTab === 'ocr' ? 'none' : 'ocr')}
              className={`px-3 py-1 text-xs font-mono font-bold rounded transition ${
                activeDrawerTab === 'ocr' ? 'bg-emerald-600 text-white' : 'bg-[#121f35] text-slate-300 hover:text-white'
              }`}
            >
              OCR Raw Fields
            </button>
          </div>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-3 py-1 bg-[#182a47] hover:bg-[#20365b] text-cyan-300 text-xs font-mono font-bold rounded transition flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            Export Official Dossier
          </button>
        </div>

        {activeDrawerTab === 'mrz' && (
          <div className="p-4 border-t border-[#182740]">
            <MRZVerificationCard mrzData={currentSession.mrzData} />
          </div>
        )}
        {activeDrawerTab === 'tamper' && (
          <div className="p-4 border-t border-[#182740]">
            <TamperDetectionCard tampering={currentSession.tampering} />
          </div>
        )}
        {activeDrawerTab === 'ocr' && (
          <div className="p-4 border-t border-[#182740]">
            <ExtractedFieldsTable fields={currentSession.fields} />
          </div>
        )}
      </div>

      {/* Bottom Fixed Action Bar (Matching Stitch Screenshot 2 Exactly!) */}
      <div className="fixed bottom-0 left-[240px] right-0 bg-[#08101e]/95 backdrop-blur-md border-t border-[#152238] px-8 py-3.5 flex items-center justify-between z-30 select-none">
        {/* Left: Add Investigator Note Button */}
        <button
          onClick={() => setShowNoteModal(true)}
          className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-slate-300 hover:text-white transition"
        >
          <Plus className="w-4 h-4 text-cyan-400" />
          <span>ADD INVESTIGATOR NOTE</span>
        </button>

        {/* Right: Decision Actions (CLEAR, FLAG, ESCALATE) */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleClear}
            className={`px-5 py-2 rounded-md font-mono text-xs font-bold uppercase tracking-wider transition ${
              currentSession.status === 'CLEARED'
                ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-[#0f192b] hover:bg-[#182740] text-slate-300 border border-[#223554]'
            }`}
          >
            CLEAR
          </button>

          <button
            onClick={handleFlag}
            className={`px-5 py-2 rounded-md font-mono text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 ${
              currentSession.status === 'SECONDARY_INSPECTION'
                ? 'bg-[#d97706] text-white shadow-[0_0_15px_rgba(217,119,6,0.3)]'
                : 'bg-[#f59e0b] hover:bg-[#d97706] text-[#0b1424] font-black'
            }`}
          >
            <Flag className="w-3.5 h-3.5 fill-current" />
            FLAG
          </button>

          <button
            onClick={handleEscalate}
            className={`px-5 py-2 rounded-md font-mono text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 ${
              currentSession.status === 'DETAINED'
                ? 'bg-[#dc2626] text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] animate-pulse'
                : 'bg-[#f87171] hover:bg-[#ef4444] text-[#0b1424] font-black'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 fill-current" />
            ESCALATE
          </button>
        </div>
      </div>

      {/* Investigator Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1424] border border-[#1e304f] rounded-xl p-5 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#182740] pb-3 mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Investigator Observation Note
              </h3>
              <button onClick={() => setShowNoteModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={4}
              value={investigatorNote}
              onChange={(e) => setInvestigatorNote(e.target.value)}
              placeholder="Enter physical UV lamp findings, subject statements, secondary inspection justification..."
              className="w-full bg-[#070e1a] border border-[#182740] rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md text-xs font-bold transition"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Camera Modal */}
      <LiveWebcamModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCaptureFace={handleCaptureLiveFace}
      />

      {/* Official Dossier Modal */}
      <OfficialDossierModal
        session={currentSession}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};
