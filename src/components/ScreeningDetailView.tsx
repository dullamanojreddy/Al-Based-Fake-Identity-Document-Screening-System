import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  Camera, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Layers, 
  Sparkles, 
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
  X,
  ScanLine,
  Target,
  UserCheck,
  Bold,
  Italic,
  Underline,
  List,
  Link2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { ScreeningSession, OfficerReviewRecord } from '../types';
import { SAMPLE_SCREENING_CASES } from '../data/sampleScreenings';
import { LiveWebcamModal } from './LiveWebcamModal';
import { OfficialDossierModal } from './OfficialDossierModal';

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
  const isUnsupported = currentSession.status === 'UNSUPPORTED_DOCUMENT' || currentSession.documentType === 'unsupported_document';

  // Document View Mode: Original, OCR, Evidence, Forensic
  const [viewMode, setViewMode] = useState<'original' | 'ocr' | 'evidence' | 'forensic'>('evidence');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedFindingId, setSelectedFindingId] = useState<string>('dob_mismatch');
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [investigatorNote, setInvestigatorNote] = useState<string>(
    currentSession.risk.officerReview?.officerNotes || ''
  );
  const [noteSavedToast, setNoteSavedToast] = useState<boolean>(false);

  // Field bounding boxes for the document viewer
  const boundingBoxes = isUnsupported ? [] : [
    { id: 'portrait', label: 'Portrait Photo', x: 23, y: 38, width: 17, height: 26, isSuspicious: false, type: 'photo' },
    { id: 'doc_no', label: 'Passport No.', x: 63, y: 30, width: 16, height: 4, value: currentSession.travelerPassportNumber || '1234567890', isSuspicious: false },
    { id: 'surname', label: 'Surname', x: 41, y: 34, width: 22, height: 4, value: currentSession.travelerName.split(' ').slice(-1)[0] || 'SPECIMEN', isSuspicious: false },
    { id: 'given_names', label: 'Given Names', x: 41, y: 39, width: 26, height: 4, value: currentSession.travelerName.split(' ').slice(0, -1).join(' ') || 'UNITED STATES', isSuspicious: false },
    { id: 'nationality', label: 'Nationality', x: 41, y: 44, width: 12, height: 4, value: currentSession.travelerNationality || 'USA', isSuspicious: false },
    { id: 'dob', label: 'Date of Birth', x: 41, y: 49, width: 18, height: 4.5, value: currentSession.travelerDob || '01 JAN 1985', isSuspicious: true, discrepancy: 'MRZ indicates 01 JAN 1995' },
    { id: 'sex', label: 'Sex', x: 41, y: 53.5, width: 8, height: 4, value: 'F', isSuspicious: false },
    { id: 'issue_date', label: 'Date of Issue', x: 41, y: 58, width: 18, height: 4, value: '01 JAN 2024', isSuspicious: false },
    { id: 'expiry_date', label: 'Date of Expiry', x: 41, y: 62.5, width: 18, height: 4, value: '01 JAN 2034', isSuspicious: false },
    { id: 'mrz', label: 'MRZ Data Zone', x: 22, y: 70, width: 58, height: 9.5, isSuspicious: false, type: 'mrz' },
  ];

  // Evidence Navigator items
  const evidenceItems = isUnsupported ? [] : [
    {
      id: 'dob_mismatch',
      title: 'Date of Birth Consistency',
      subtitle: 'MRZ and visual data do not match',
      severity: 'HIGH' as const,
      category: 'MRZ / VIZ DISCREPANCY',
      visualValue: '01 JAN 1985',
      mrzValue: '850101 -> 01 JAN 1995 (Checksum CD: 7)',
      reason: 'Visual DOB and MRZ DOB do not represent the same calendar date. Potential counterfeit alteration in visual zone.',
      targetBoxId: 'dob',
    },
    {
      id: 'bio_match',
      title: 'Biometric Photo Match',
      subtitle: 'Face similarity below threshold (62%)',
      severity: 'HIGH' as const,
      category: '1:1 FACIAL BIOMETRICS',
      similarityScore: 62.0,
      confidence: 'High Discrepancy',
      reason: 'Live passenger nodal geometry differs from passport portrait. High confidence of imposter substitution.',
      targetBoxId: 'portrait',
    },
    {
      id: 'security_features',
      title: 'Document Security Features',
      subtitle: 'All visible security features intact',
      severity: 'PASS' as const,
      category: 'FORENSIC SUBSTRATE',
      reason: 'Guilloche security background, microprinting, and UV luminescence show uniform integrity.',
      targetBoxId: 'mrz',
    },
  ];

  const activeEvidence = evidenceItems.find(e => e.id === selectedFindingId) || evidenceItems[0];

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

  const handleApprove = () => {
    onUpdateSession({ ...currentSession, status: 'CLEARED' });
  };

  const handleSendForReview = () => {
    onUpdateSession({ ...currentSession, status: 'SECONDARY_INSPECTION' });
  };

  const handleSaveNotes = () => {
    setNoteSavedToast(true);
    setTimeout(() => setNoteSavedToast(false), 2000);
  };

  const documentImageSrc = currentSession.documentImageUrl || '/sample_passport_clean.jpg';

  return (
    <div className="space-y-5 pb-16 text-slate-200 font-sans">
      {/* Top Breadcrumb / Case Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#152238] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isUnsupported ? 'bg-red-400' : 'bg-cyan-400'} animate-pulse`} />
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              SCREENING ID:
            </span>
            <span className="text-sm font-bold text-white font-mono">{currentSession.id}</span>
          </div>

          <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
            isUnsupported
              ? 'bg-red-950 text-red-400 border border-red-800'
              : 'bg-amber-950 text-amber-400 border border-amber-800'
          }`}>
            ● {currentSession.status.replace('_', ' ')}
          </span>
        </div>

        {/* Action Tray */}
        <div className="flex items-center gap-2">
          {/* Sample Case Switcher Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#0b1424] border border-[#182740] rounded-md px-2 py-1 text-xs">
            <span className="text-[10px] font-mono text-slate-400">DEMO CASE:</span>
            <select
              value={currentSession.id}
              onChange={(e) => {
                const found = SAMPLE_SCREENING_CASES.find((s) => s.id === e.target.value);
                if (found) onSelectSampleCase(found);
              }}
              className="bg-transparent text-cyan-300 font-mono text-xs focus:outline-none cursor-pointer"
            >
              {SAMPLE_SCREENING_CASES.map((cs) => (
                <option key={cs.id} value={cs.id} className="bg-[#070e1a] text-slate-200">
                  {cs.id} - {cs.travelerName} ({cs.risk.overallRiskScore}%)
                </option>
              ))}
            </select>
          </div>

          {!isUnsupported && (
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-3 py-1 bg-[#121f35] hover:bg-[#182a47] text-slate-300 hover:text-white border border-[#223553] rounded text-xs font-mono font-bold uppercase transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export Report
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CASE A: UNSUPPORTED DOCUMENT REJECTION STATE (GATED & SAFELY TERMINATED)   */}
      {/* ========================================================================= */}
      {isUnsupported ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Actual Document Uploaded Viewport */}
          <div className="lg:col-span-6 bg-[#0b1424] border border-[#182740] rounded-xl p-5 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#182740] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-400" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    UPLOADED DOCUMENT FILE
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-900">
                  REJECTED AT STRUCTURAL GATE
                </span>
              </div>

              {/* Viewport: Renders actual document/PDF uploaded */}
              <div className="relative w-full aspect-[4/3] bg-[#070e1a] rounded-xl border border-[#142239] overflow-hidden flex items-center justify-center p-3 shadow-inner">
                {currentSession.documentImageUrl?.startsWith('data:application/pdf') || currentSession.documentImageUrl?.endsWith('.pdf') ? (
                  <object
                    data={`${currentSession.documentImageUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                    type="application/pdf"
                    className="w-full h-full min-h-[380px] rounded-lg"
                  >
                    <iframe
                      src={`${currentSession.documentImageUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                      className="w-full h-full min-h-[380px] border-0 rounded-lg"
                      title="PDF Document View"
                    />
                  </object>
                ) : (
                  <img
                    src={documentImageSrc}
                    alt="Uploaded Document"
                    className="w-full h-full object-contain block rounded-lg"
                  />
                )}
              </div>
            </div>

            <div className="text-xs font-mono text-slate-400 pt-3 border-t border-[#182740] mt-3 flex justify-between">
              <span>File: <strong className="text-white">{currentSession.travelerName}</strong></span>
              <span className="text-red-400 font-bold">No Identity Metadata Extracted</span>
            </div>
          </div>

          {/* Right: Rejection Card matching User Specification */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-[#1b141d] border-2 border-[#882233] rounded-xl p-6 shadow-2xl space-y-5">
              <div className="flex items-start gap-4 border-b border-[#3b1219] pb-4">
                <div className="p-3 bg-[#3b1219] text-[#f87171] border border-[#882233] rounded-xl shrink-0">
                  <AlertOctagon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide font-sans">
                    ⚠ UNSUPPORTED DOCUMENT TYPE
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
                    The uploaded document could not be identified as a supported identity or travel document.
                  </p>
                </div>
              </div>

              {/* Classification Info Box */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-[#070e1a] p-3 rounded-lg border border-[#182740]">
                  <span className="text-[10px] text-slate-400 uppercase block mb-1">
                    DETECTED TYPE
                  </span>
                  <span className="text-sm font-bold text-red-400 block">
                    UNKNOWN / GENERAL DOCUMENT
                  </span>
                </div>

                <div className="bg-[#070e1a] p-3 rounded-lg border border-[#182740]">
                  <span className="text-[10px] text-slate-400 uppercase block mb-1">
                    CLASSIFIER CONFIDENCE
                  </span>
                  <span className="text-sm font-bold text-white block">
                    {currentSession.detectedClassificationConfidence || 96.4}%
                  </span>
                </div>
              </div>

              {/* Structural Gating Findings */}
              <div className="bg-[#070e1a] p-4 rounded-lg border border-[#182740] space-y-2 text-xs font-sans">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                  GATE VALIDATION FAILURES
                </span>
                <div className="flex items-center gap-2 text-slate-300">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>No passport machine-readable zone (MRZ) detected</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>No supported identity-document structure or visual zone detected</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Semantic classification identified file as an ordinary academic/memo document</span>
                </div>
              </div>

              {/* Supported Documents List */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                  SUPPORTED CREDENTIAL FORMATS:
                </span>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-[#121f35] border border-[#223553] text-cyan-300 rounded font-mono text-xs">
                    Passport (ICAO 9303)
                  </span>
                  <span className="px-2.5 py-1 bg-[#121f35] border border-[#223553] text-cyan-300 rounded font-mono text-xs">
                    Visa Vignette
                  </span>
                  <span className="px-2.5 py-1 bg-[#121f35] border border-[#223553] text-cyan-300 rounded font-mono text-xs">
                    National ID Card
                  </span>
                  <span className="px-2.5 py-1 bg-[#121f35] border border-[#223553] text-cyan-300 rounded font-mono text-xs">
                    Driving Licence
                  </span>
                  <span className="px-2.5 py-1 bg-[#121f35] border border-[#223553] text-cyan-300 rounded font-mono text-xs">
                    Border Permit
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#2a0e14] border border-[#882233] rounded-lg text-xs text-[#fca5a5] font-mono">
                🛑 <strong>PIPELINE TERMINATED:</strong> Identity validation and risk scoring were safely bypassed to prevent hallucinated biometric and document findings.
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* CASE B: VALID IDENTITY DOCUMENT SCREENING WORKBENCH                       */
        /* ========================================================================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: DOCUMENT PREVIEW & INTERACTIVE EVIDENCE SURFACE */}
          <div className="lg:col-span-6 bg-[#0b1424] border border-[#182740] rounded-xl p-5 shadow-2xl flex flex-col justify-between">
            <div>
              {/* Document Header & Mode Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#182740] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    DOCUMENT PREVIEW
                  </h3>
                </div>

                {/* View Mode Switcher: [ Original ] [ OCR ] [ Evidence ] [ Forensic ] */}
                <div className="flex items-center gap-1 bg-[#070e1a] p-1 rounded-lg border border-[#182740]">
                  <button
                    onClick={() => setViewMode('original')}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded transition ${
                      viewMode === 'original'
                        ? 'bg-[#182a47] text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Original
                  </button>
                  <button
                    onClick={() => setViewMode('ocr')}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded transition ${
                      viewMode === 'ocr'
                        ? 'bg-[#182a47] text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    OCR
                  </button>
                  <button
                    onClick={() => setViewMode('evidence')}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded transition ${
                      viewMode === 'evidence'
                        ? 'bg-[#182a47] text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Evidence
                  </button>
                  <button
                    onClick={() => setViewMode('forensic')}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded transition ${
                      viewMode === 'forensic'
                        ? 'bg-[#182a47] text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Forensic
                  </button>
                </div>
              </div>

              {/* Document Interactive Surface Viewport */}
              <div className="relative w-full aspect-[4/3] bg-[#070e1a] rounded-xl border border-[#142239] overflow-hidden flex items-center justify-center p-3 shadow-inner">
                {/* Dark Blueprint Grid Background */}
                <div 
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                  }}
                />

                {/* Document Image Surface */}
                <div 
                  className="relative max-w-full max-h-full rounded-lg overflow-hidden border border-slate-700 shadow-2xl transition-transform duration-300 select-none"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  {currentSession.documentImageUrl?.startsWith('data:application/pdf') || currentSession.documentImageUrl?.endsWith('.pdf') ? (
                    <object
                      data={`${currentSession.documentImageUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                      type="application/pdf"
                      className="w-full h-full min-h-[380px] rounded-lg"
                    >
                      <iframe
                        src={`${currentSession.documentImageUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="w-full h-full min-h-[380px] border-0 rounded-lg"
                        title="PDF Document View"
                      />
                    </object>
                  ) : (
                    <img
                      src={documentImageSrc}
                      alt="Passport Specimen"
                      onError={(e) => {
                        e.currentTarget.src = '/sample_passport_clean.jpg';
                      }}
                      className={`w-full h-auto object-contain block transition-all ${
                        viewMode === 'forensic' ? 'brightness-75 contrast-125 saturate-150' : ''
                      }`}
                    />
                  )}

                  {/* 1. OCR Bounding Boxes (When in 'ocr' mode) */}
                  {viewMode === 'ocr' && (
                    <div className="absolute inset-0 pointer-events-none">
                      {boundingBoxes.map((box) => (
                        <div
                          key={box.id}
                          className="absolute border border-cyan-400/80 bg-cyan-500/10 rounded pointer-events-auto cursor-pointer hover:bg-cyan-500/30 transition group"
                          style={{
                            left: `${box.x}%`,
                            top: `${box.y}%`,
                            width: `${box.width}%`,
                            height: `${box.height}%`,
                          }}
                        >
                          <span className="absolute -top-4 left-0 bg-[#070e1a] text-cyan-300 border border-cyan-500 text-[8px] font-mono font-bold px-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-20">
                            {box.label} ({box.value || 'Detected'})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 2. Evidence Focus Highlights (When in 'evidence' mode) */}
                  {viewMode === 'evidence' && (
                    <div className="absolute inset-0 pointer-events-none">
                      {/* DOB Mismatch Red Glowing Bounding Box */}
                      <div 
                        onClick={() => setSelectedFindingId('dob_mismatch')}
                        className={`absolute border-2 rounded pointer-events-auto cursor-pointer transition-all duration-300 z-20 ${
                          selectedFindingId === 'dob_mismatch'
                            ? 'border-[#ef4444] bg-red-500/25 ring-4 ring-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse'
                            : 'border-red-500/80 bg-red-500/10 hover:bg-red-500/20'
                        }`}
                        style={{ left: '40%', top: '48%', width: '20%', height: '5.5%' }}
                      >
                        <div className="absolute -top-6 left-0 bg-[#3b1219] text-[#fca5a5] border border-[#882233] text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-lg flex items-center gap-1 whitespace-nowrap">
                          <AlertTriangle className="w-2.5 h-2.5 text-[#f87171]" />
                          DOB MISMATCH (VIZ vs MRZ)
                        </div>
                      </div>

                      {/* Photo Splicing / Face Anomaly Amber Bounding Box */}
                      <div
                        onClick={() => setSelectedFindingId('bio_match')}
                        className={`absolute border-2 rounded pointer-events-auto cursor-pointer transition-all duration-300 z-10 ${
                          selectedFindingId === 'bio_match'
                            ? 'border-[#f59e0b] bg-amber-500/20 ring-4 ring-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.8)]'
                            : 'border-amber-500/60 bg-amber-500/10 hover:bg-amber-500/20'
                        }`}
                        style={{ left: '22.5%', top: '37%', width: '18%', height: '27%' }}
                      >
                        <div className="absolute -top-6 left-0 bg-[#291e11] text-[#fbbf24] border border-[#784d12] text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-lg flex items-center gap-1 whitespace-nowrap">
                          <ScanLine className="w-2.5 h-2.5 text-[#f59e0b]" />
                          BIOMETRIC TARGET (62%)
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. Forensic Mode Overlays */}
                  {viewMode === 'forensic' && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div 
                        className="absolute inset-0 opacity-40 mix-blend-color-dodge"
                        style={{
                          background: 'radial-gradient(circle at 31% 50%, rgba(244, 63, 94, 0.7) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.4) 0%, transparent 60%)'
                        }}
                      />
                      <div className="absolute left-[26%] top-[42%] w-[11%] h-[16%] border border-cyan-400/60 rounded flex items-center justify-center">
                        <div className="grid grid-cols-4 gap-1 opacity-70">
                          {Array.from({ length: 16 }).map((_, i) => (
                            <span key={i} className="w-1 h-1 rounded-full bg-cyan-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Zoom & Layer Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-[#182740] mt-3 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 uppercase">ZOOM:</span>
                <button
                  onClick={() => setZoomLevel(Math.max(0.8, zoomLevel - 0.1))}
                  className="p-1 rounded bg-[#070e1a] border border-[#182740] hover:text-white transition"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-slate-300 px-1">{(zoomLevel * 100).toFixed(0)}%</span>
                <button
                  onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))}
                  className="p-1 rounded bg-[#070e1a] border border-[#182740] hover:text-white transition"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-1 rounded bg-[#070e1a] border border-[#182740] hover:text-white transition ml-1"
                  title="Reset zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-[11px] text-slate-400">
                Active Focus: <strong className="text-cyan-400 uppercase">{selectedFindingId.replace('_', ' ')}</strong>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: EVIDENCE FOCUS, BIOMETRICS & VERIFICATION */}
          <div className="lg:col-span-6 space-y-4">
            {/* Top Banner: Enhanced Review Recommended */}
            <div className="bg-[#1b141d] border border-[#882233] rounded-xl p-4 shadow-lg flex items-start gap-3.5">
              <div className="p-2 bg-[#3b1219] text-[#f87171] border border-[#882233] rounded-lg shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-[#f87171] tracking-wide font-sans">
                  Enhanced Review Recommended
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed font-sans">
                  Discrepancies detected require manual review and verification prior to border clearance.
                </p>
              </div>
            </div>

            {/* DYNAMIC EVIDENCE FOCUS PANEL */}
            <div className="bg-[#0b1424] border border-[#182740] rounded-xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-[#182740] pb-2.5">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    EVIDENCE FOCUS: {activeEvidence?.title}
                  </h4>
                </div>

                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded ${
                  activeEvidence?.severity === 'HIGH' ? 'bg-[#3b1219] text-[#fca5a5] border border-[#882233]' : 'bg-[#112419] text-[#6ee7b7]'
                }`}>
                  {activeEvidence?.severity} PRIORITY
                </span>
              </div>

              {/* If DOB Mismatch is focused */}
              {activeEvidence?.id === 'dob_mismatch' && (
                <div className="space-y-2.5 text-xs font-sans">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#070e1a] p-3 rounded-lg border border-[#182740]">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                        DOCUMENT FIELD (VIZ)
                      </span>
                      <span className="text-sm font-mono font-bold text-white block">
                        {activeEvidence.visualValue}
                      </span>
                    </div>

                    <div className="bg-[#070e1a] p-3 rounded-lg border border-[#182740]">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                        MRZ ENCODED FIELD
                      </span>
                      <span className="text-sm font-mono font-bold text-[#f87171] block">
                        {activeEvidence.mrzValue}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#2a0e14] border border-[#882233] p-3 rounded-lg text-xs text-[#fca5a5]">
                    <strong className="block font-mono text-[11px] mb-0.5">⚠ PARITY FAILURE REASON:</strong>
                    {activeEvidence.reason}
                  </div>
                </div>
              )}

              {/* If Face Match is focused */}
              {activeEvidence?.id === 'bio_match' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Circular Gauge */}
                    <div className="bg-[#070e1a] p-3 rounded-lg border border-[#182740] flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-mono text-slate-400 uppercase mb-2">
                        FACE MATCH SCORE
                      </span>

                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-[#182a47]"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-[#f87171]"
                            strokeDasharray="62, 100"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <span className="absolute text-lg font-bold font-mono text-white">62%</span>
                      </div>

                      <span className="text-xs font-mono text-[#f87171] font-bold mt-1.5 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Low Similarity
                      </span>
                    </div>

                    {/* Side by Side Photos */}
                    <div className="bg-[#070e1a] p-3 rounded-lg border border-[#182740] flex items-center justify-around">
                      <div className="text-center">
                        <span className="text-[9px] font-mono text-slate-400 block mb-1">DOC PHOTO</span>
                        <div className="w-14 h-18 bg-slate-900 rounded border border-slate-700 overflow-hidden">
                          <img
                            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80"
                            alt="Doc"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      <div className="text-center">
                        <span className="text-[9px] font-mono text-slate-400 block mb-1">LIVE PERSON</span>
                        <div className="w-14 h-18 bg-slate-900 rounded border border-cyan-500 overflow-hidden">
                          <img
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                            alt="Live"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setIsCameraModalOpen(true)}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow"
                    >
                      <Camera className="w-3.5 h-3.5" /> Re-Capture Live Camera
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Extracted Fields Table matching Reference Screenshot */}
            <div className="bg-[#0b1424] border border-[#182740] rounded-xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-[#182740] pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    EXTRACTED FIELDS
                  </h4>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="text-[9px] font-mono text-slate-400 uppercase border-b border-[#182740]">
                    <tr>
                      <th className="py-1.5 px-2">FIELD</th>
                      <th className="py-1.5 px-2">EXTRACTED VALUE</th>
                      <th className="py-1.5 px-2 text-right">CONFIDENCE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#15233a] font-sans text-xs">
                    <tr>
                      <td className="py-1.5 px-2 text-slate-400 font-medium">Document Type</td>
                      <td className="py-1.5 px-2 text-white">Passport</td>
                      <td className="py-1.5 px-2 text-right font-mono text-slate-300">98%</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 text-slate-400 font-medium">Issuing State</td>
                      <td className="py-1.5 px-2 text-white">USA</td>
                      <td className="py-1.5 px-2 text-right font-mono text-slate-300">99%</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 text-slate-400 font-medium">Surname</td>
                      <td className="py-1.5 px-2 text-white font-mono">UNITED STATES SPECIMEN</td>
                      <td className="py-1.5 px-2 text-right font-mono text-slate-300">96%</td>
                    </tr>
                    <tr className="bg-[#2a0e14]/60">
                      <td className="py-1.5 px-2 text-[#f87171] font-bold flex items-center gap-1">
                        Date of Birth
                      </td>
                      <td className="py-1.5 px-2 font-mono font-bold text-[#f87171]">
                        01 JAN 1985
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono text-[#f87171] font-bold flex items-center justify-end gap-1">
                        92% <AlertTriangle className="w-3 h-3 text-[#f59e0b]" />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 text-slate-400 font-medium">Sex</td>
                      <td className="py-1.5 px-2 text-white font-mono">F</td>
                      <td className="py-1.5 px-2 text-right font-mono text-slate-300">97%</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 text-slate-400 font-medium">Date of Issue</td>
                      <td className="py-1.5 px-2 text-white font-mono">01 JAN 2024</td>
                      <td className="py-1.5 px-2 text-right font-mono text-slate-300">96%</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 text-slate-400 font-medium">Date of Expiry</td>
                      <td className="py-1.5 px-2 text-white font-mono">01 JAN 2034</td>
                      <td className="py-1.5 px-2 text-right font-mono text-slate-300">97%</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 text-slate-400 font-medium">Passport Number</td>
                      <td className="py-1.5 px-2 text-white font-mono">1234567890</td>
                      <td className="py-1.5 px-2 text-right font-mono text-slate-300">98%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* MRZ Status Sub-card */}
              <div className="bg-[#070e1a] p-3 rounded-lg border border-[#182740] space-y-1.5 text-xs font-sans">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                  MRZ STATUS
                </span>
                <div className="flex items-center gap-1.5 text-[#4ade80] font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4ade80]" />
                  MRZ Checksum: Valid (All MRZ check digits passed)
                </div>
                <div className="flex items-center gap-1.5 text-[#fbbf24] font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b]" />
                  Date of Birth (MRZ vs Visual): Mismatch
                </div>
                <div className="text-[11px] font-mono text-slate-400 pl-5">
                  MRZ DOB: <strong className="text-white">01 JAN 1995</strong> | Visual DOB: <strong className="text-[#f87171]">01 JAN 1985</strong>
                </div>
              </div>
            </div>

            {/* EVIDENCE NAVIGATOR */}
            <div className="bg-[#0b1424] border border-[#182740] rounded-xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-[#182740] pb-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    EVIDENCE NAVIGATOR (CLICK TO FOCUS ON DOCUMENT)
                  </h4>
                </div>
              </div>

              <div className="space-y-2">
                {evidenceItems.map((item) => {
                  const isSelected = selectedFindingId === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedFindingId(item.id);
                        setViewMode('evidence');
                      }}
                      className={`p-3 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#182a47] border-cyan-400 ring-1 ring-cyan-400 shadow-md'
                          : 'bg-[#070e1a] border-[#182740] hover:bg-[#101c30]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md ${
                          item.severity === 'HIGH' ? 'bg-[#3b1219] text-[#f87171]' : 'bg-[#112419] text-[#4ade80]'
                        }`}>
                          {item.severity === 'HIGH' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-white">{item.title}</h5>
                          <p className="text-[11px] text-slate-400">{item.subtitle}</p>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded ${
                        item.severity === 'HIGH'
                          ? 'bg-[#3b1219] text-[#fca5a5] border border-[#882233]'
                          : 'bg-[#112419] text-[#6ee7b7] border border-[#1d5236]'
                      }`}>
                        {item.severity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* OFFICER NOTES & ACTION BUTTONS */}
            <div className="bg-[#0b1424] border border-[#182740] rounded-xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-[#182740] pb-2">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    OFFICER NOTES &amp; DECISION
                  </h4>
                </div>
                {noteSavedToast && (
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Saved
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <textarea
                  rows={2}
                  placeholder="Add notes or forensic observations for this identity screening..."
                  value={investigatorNote}
                  onChange={(e) => setInvestigatorNote(e.target.value)}
                  className="w-full bg-[#070e1a] border border-[#182740] rounded-md p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
                />

                <div className="flex items-center gap-2 text-slate-400 text-xs px-1">
                  <button type="button" className="p-1 hover:text-white transition"><Bold className="w-3.5 h-3.5" /></button>
                  <button type="button" className="p-1 hover:text-white transition"><Italic className="w-3.5 h-3.5" /></button>
                  <button type="button" className="p-1 hover:text-white transition"><Underline className="w-3.5 h-3.5" /></button>
                  <button type="button" className="p-1 hover:text-white transition"><List className="w-3.5 h-3.5" /></button>
                  <button type="button" className="p-1 hover:text-white transition"><Link2 className="w-3.5 h-3.5" /></button>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="ml-auto px-2.5 py-0.5 bg-[#182a47] hover:bg-[#22395e] text-white text-[10px] font-mono font-bold uppercase rounded transition"
                  >
                    Save Note
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleSendForReview}
                  className="w-full py-2.5 bg-transparent hover:bg-amber-950/40 text-[#f59e0b] border-2 border-[#f59e0b] font-bold text-xs uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                  Send for Review
                </button>

                <button
                  onClick={handleApprove}
                  className="w-full py-2.5 bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  Approve &amp; Release
                </button>
              </div>
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

      {/* Official PDF / JSON Dossier Modal */}
      <OfficialDossierModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        session={currentSession}
      />
    </div>
  );
};
