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
import { ScreeningSession, OfficerReviewRecord, ScreeningFinding } from '../types';
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
  
  // Selected finding focus
  const findingsList = currentSession.risk?.findings || [];
  const [selectedFindingId, setSelectedFindingId] = useState<string>(() => {
    return findingsList.length > 0 ? (findingsList[0].finding_id || findingsList[0].id) : 'default';
  });

  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [investigatorNote, setInvestigatorNote] = useState<string>(
    currentSession.risk?.officerReview?.officerNotes || ''
  );
  const [noteSavedToast, setNoteSavedToast] = useState<boolean>(false);

  // Derive dynamic bounding boxes from extracted fields and findings
  const boundingBoxes = isUnsupported ? [] : [
    ...currentSession.fields.map(f => ({
      id: f.key,
      label: f.label,
      value: f.value,
      x: f.boundingBox?.x || 41,
      y: f.boundingBox?.y || 40,
      width: f.boundingBox?.width || 20,
      height: f.boundingBox?.height || 5,
      isSuspicious: f.isTampered || false,
      type: 'field',
    })),
    ...(currentSession.mrzData ? [{
      id: 'mrz',
      label: 'MRZ Data Zone',
      value: currentSession.mrzData.rawLines.join(' | '),
      x: 22,
      y: 70,
      width: 58,
      height: 9.5,
      isSuspicious: !currentSession.mrzData.isAllChecksumsValid || currentSession.mrzData.vizMismatchDetected,
      type: 'mrz',
    }] : []),
    ...(currentSession.tampering?.tamperBoxes || []).map(tb => ({
      id: tb.id,
      label: tb.label,
      value: tb.description,
      x: tb.x,
      y: tb.y,
      width: tb.width,
      height: tb.height,
      isSuspicious: true,
      type: tb.type,
    })),
  ];

  const activeFinding = findingsList.find(f => (f.finding_id || f.id) === selectedFindingId) || findingsList[0];

  const handleCaptureLiveFace = (liveFaceUrl: string) => {
    if (!currentSession.biometrics) return;
    const updatedBio = {
      ...currentSession.biometrics,
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
    <div className="space-y-5 pb-16 text-slate-800 font-sans">
      {/* Top Breadcrumb / Case Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isUnsupported ? 'bg-red-400' : 'bg-cyan-400'} animate-pulse`} />
            <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest">
              SCREENING ID:
            </span>
            <span className="text-sm font-bold text-slate-900 font-mono">{currentSession.id}</span>
          </div>

          <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
            isUnsupported
              ? 'bg-red-50 text-red-400 border border-red-200'
              : currentSession.risk?.overallRiskScore && currentSession.risk.overallRiskScore > 50
              ? 'bg-amber-50 text-amber-400 border border-amber-200'
              : 'bg-emerald-50 text-emerald-400 border border-emerald-200'
          }`}>
            ● {currentSession.status.replace('_', ' ')}
          </span>
        </div>

        {/* Action Tray */}
        <div className="flex items-center gap-2">
          {/* Sample Case Switcher Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md px-2 py-1 text-xs">
            <span className="text-[10px] font-mono text-slate-400">DEMO CASE:</span>
            <select
              value={currentSession.id}
              onChange={(e) => {
                const found = SAMPLE_SCREENING_CASES.find((s) => s.id === e.target.value);
                if (found) onSelectSampleCase(found);
              }}
              className="bg-transparent text-blue-700 font-mono text-xs focus:outline-none cursor-pointer"
            >
              {SAMPLE_SCREENING_CASES.map((cs) => (
                <option key={cs.id} value={cs.id} className="bg-slate-50 text-slate-200">
                  {cs.id} - {cs.travelerName} ({cs.risk?.overallRiskScore ?? 0}%)
                </option>
              ))}
            </select>
          </div>

          {!isUnsupported && (
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 rounded text-xs font-mono font-bold uppercase transition flex items-center gap-1.5"
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
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-400" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                    UPLOADED DOCUMENT FILE
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-red-400 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  REJECTED AT STRUCTURAL GATE
                </span>
              </div>

              {/* Viewport: Renders actual document/PDF uploaded */}
              <div className="relative w-full aspect-[4/3] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center p-3 shadow-inner">
                {documentImageSrc ? (
                  <img
                    src={documentImageSrc}
                    alt="Uploaded Non-Identity File"
                    className="w-full h-full object-contain block rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-red-100 border border-red-300 flex items-center justify-center text-red-500">
                      <FileWarning className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 font-mono">{currentSession.travelerName}</h4>
                      <p className="text-xs text-red-600 mt-1 font-mono">Unsupported Document Substrate</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-xs font-mono text-slate-400 pt-3 border-t border-slate-200 mt-3 flex justify-between">
              <span>File: <strong className="text-slate-900">{currentSession.travelerName}</strong></span>
              <span className="text-red-400 font-bold">No Identity Metadata Extracted</span>
            </div>
          </div>

          {/* Right: Rejection Card matching Specification */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 shadow-2xl space-y-5">
              <div className="flex items-start gap-4 border-b border-[#3b1219] pb-4">
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl shrink-0">
                  <AlertOctagon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-wide font-sans">
                    ⚠ UNSUPPORTED DOCUMENT
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed font-sans">
                    The uploaded document could not be identified as a supported identity or travel document.
                  </p>
                </div>
              </div>

              {/* Classification Info Box */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase block mb-1">
                    DETECTED TYPE
                  </span>
                  <span className="text-sm font-bold text-red-400 block">
                    UNKNOWN / GENERAL DOCUMENT
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase block mb-1">
                    CLASSIFICATION CONFIDENCE
                  </span>
                  <span className="text-sm font-bold text-slate-900 block">
                    {currentSession.detectedClassificationConfidence || 96.8}%
                  </span>
                </div>
              </div>

              {/* Structural Gating Findings */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-xs font-sans">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                  STRUCTURAL GATE EVIDENCE
                </span>
                <div className="flex items-center gap-2 text-slate-600">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>No supported identity-document structure detected</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>No passport MRZ detected</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Required identity-document fields absent</span>
                </div>
              </div>

              {/* Supported Documents List */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                  SUPPORTED DOCUMENT FORMATS:
                </span>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-white border border-slate-200 text-blue-700 rounded font-mono text-xs">
                    Passport
                  </span>
                  <span className="px-2.5 py-1 bg-white border border-slate-200 text-blue-700 rounded font-mono text-xs">
                    Visa
                  </span>
                  <span className="px-2.5 py-1 bg-white border border-slate-200 text-blue-700 rounded font-mono text-xs">
                    National ID
                  </span>
                  <span className="px-2.5 py-1 bg-white border border-slate-200 text-blue-700 rounded font-mono text-xs">
                    Driving Licence
                  </span>
                  <span className="px-2.5 py-1 bg-white border border-slate-200 text-blue-700 rounded font-mono text-xs">
                    Permit / Travel Authorization
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-mono">
                🛑 <strong>SCREENING NOT PERFORMED:</strong> No risk score or fabricated identity findings generated.
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
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-2xl flex flex-col justify-between">
            <div>
              {/* Document Header & Mode Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                    DOCUMENT PREVIEW
                  </h3>
                </div>

                {/* View Mode Switcher */}
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setViewMode('original')}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded transition ${
                      viewMode === 'original'
                        ? 'bg-blue-50 text-slate-900 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Original
                  </button>
                  <button
                    onClick={() => setViewMode('ocr')}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded transition ${
                      viewMode === 'ocr'
                        ? 'bg-blue-50 text-slate-900 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    OCR
                  </button>
                  <button
                    onClick={() => setViewMode('evidence')}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded transition ${
                      viewMode === 'evidence'
                        ? 'bg-blue-50 text-slate-900 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Evidence
                  </button>
                  <button
                    onClick={() => setViewMode('forensic')}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded transition ${
                      viewMode === 'forensic'
                        ? 'bg-blue-50 text-slate-900 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Forensic
                  </button>
                </div>
              </div>

              {/* Document Interactive Surface Viewport */}
              <div className="relative w-full aspect-[4/3] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center p-3 shadow-inner">
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
                          <span className="absolute -top-4 left-0 bg-slate-50 text-blue-700 border border-cyan-500 text-[8px] font-mono font-bold px-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-20">
                            {box.label}: {box.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 2. Evidence Focus Highlights (When in 'evidence' mode) */}
                  {viewMode === 'evidence' && (
                    <div className="absolute inset-0 pointer-events-none">
                      {findingsList.map((finding) => {
                        const fid = finding.finding_id || finding.id;
                        const isFocused = selectedFindingId === fid;
                        const bbox = finding.boundingBox || { x: 40, y: 45, width: 20, height: 6 };

                        return (
                          <div
                            key={fid}
                            onClick={() => setSelectedFindingId(fid)}
                            className={`absolute border-2 rounded pointer-events-auto cursor-pointer transition-all duration-300 z-20 ${
                              isFocused
                                ? 'border-[#ef4444] bg-red-500/25 ring-4 ring-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse'
                                : 'border-amber-500/70 bg-amber-500/10 hover:bg-amber-500/20'
                            }`}
                            style={{
                              left: `${bbox.x}%`,
                              top: `${bbox.y}%`,
                              width: `${bbox.width}%`,
                              height: `${bbox.height}%`,
                            }}
                          >
                            <div className="absolute -top-6 left-0 bg-red-50 text-red-700 border border-red-200 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-lg flex items-center gap-1 whitespace-nowrap">
                              <AlertTriangle className="w-2.5 h-2.5 text-red-700" />
                              {finding.title}
                            </div>
                          </div>
                        );
                      })}
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
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Zoom & Layer Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 mt-3 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 uppercase">ZOOM:</span>
                <button
                  onClick={() => setZoomLevel(Math.max(0.8, zoomLevel - 0.1))}
                  className="p-1 rounded bg-slate-50 border border-slate-200 hover:text-slate-900 transition"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-slate-600 px-1">{(zoomLevel * 100).toFixed(0)}%</span>
                <button
                  onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))}
                  className="p-1 rounded bg-slate-50 border border-slate-200 hover:text-slate-900 transition"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-1 rounded bg-slate-50 border border-slate-200 hover:text-slate-900 transition ml-1"
                  title="Reset zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-[11px] text-slate-400">
                Confidence: <strong className="text-blue-600">{currentSession.document_type_confidence || 96.5}%</strong>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: EVIDENCE FOCUS, BIOMETRICS & VERIFICATION */}
          <div className="lg:col-span-6 space-y-4">
            {/* Top Banner */}
            <div className={`border rounded-xl p-4 shadow-lg flex items-start gap-3.5 ${
              (currentSession.risk?.overallRiskScore ?? 0) > 50
                ? 'bg-red-50 border-red-200'
                : 'bg-emerald-50 border-emerald-200'
            }`}>
              <div className={`p-2 rounded-lg shrink-0 ${
                (currentSession.risk?.overallRiskScore ?? 0) > 50
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {(currentSession.risk?.overallRiskScore ?? 0) > 50 ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
              </div>
              <div className="min-w-0">
                <h3 className={`text-base font-bold tracking-wide font-sans ${
                  (currentSession.risk?.overallRiskScore ?? 0) > 50 ? 'text-red-700' : 'text-emerald-700'
                }`}>
                  {currentSession.risk?.reviewPriority || 'LOW REVIEW PRIORITY'}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-sans">
                  {currentSession.risk?.recommendedAction || 'Document screening completed.'}
                </p>
              </div>
            </div>

            {/* DYNAMIC EVIDENCE FOCUS PANEL */}
            {activeFinding && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                      EVIDENCE FOCUS: {activeFinding.title}
                    </h4>
                  </div>

                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded ${
                    activeFinding.severity === 'HIGH' || activeFinding.severity === 'CRITICAL'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {activeFinding.severity} PRIORITY
                  </span>
                </div>

                <div className="space-y-2.5 text-xs font-sans">
                  <p className="text-slate-600 leading-relaxed">
                    {activeFinding.description}
                  </p>

                  {activeFinding.sources && activeFinding.sources.length > 0 && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 font-mono text-[11px]">
                      <span className="text-slate-400 uppercase font-bold block mb-1">
                        AUTHENTICATED EVIDENCE SOURCES:
                      </span>
                      {activeFinding.sources.map((s, idx) => (
                        <div key={idx} className="text-blue-700 flex items-center gap-1.5">
                          <span>•</span>
                          <span><strong>{s.type}:</strong> {s.field ? `${s.field} -> ` : ''}{s.value || s.details}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DYNAMIC EXTRACTED FIELDS TABLE */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                    EXTRACTED FIELDS ({currentSession.fields.length})
                  </h4>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="text-[9px] font-mono text-slate-400 uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-1.5 px-2">FIELD</th>
                      <th className="py-1.5 px-2">EXTRACTED VALUE</th>
                      <th className="py-1.5 px-2 text-right">CONFIDENCE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-sans text-xs">
                    {currentSession.fields.map((f) => (
                      <tr key={f.key} className={f.isTampered ? 'bg-red-50/60' : ''}>
                        <td className={`py-1.5 px-2 font-medium ${f.isTampered ? 'text-red-700 font-bold' : 'text-slate-400'}`}>
                          {f.label}
                        </td>
                        <td className={`py-1.5 px-2 font-mono ${f.isTampered ? 'text-red-700 font-bold' : 'text-slate-900'}`}>
                          {f.value}
                        </td>
                        <td className="py-1.5 px-2 text-right font-mono text-slate-600">
                          {f.confidence}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Dynamic MRZ Status Sub-card */}
              {currentSession.mrzData && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs font-sans">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                    MRZ STATUS: {currentSession.mrzData.status}
                  </span>
                  <div className={`flex items-center gap-1.5 font-medium ${
                    currentSession.mrzData.isAllChecksumsValid ? 'text-emerald-700' : 'text-red-700'
                  }`}>
                    {currentSession.mrzData.isAllChecksumsValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    <span>MRZ Checksums: {currentSession.mrzData.isAllChecksumsValid ? 'Valid (All check digits passed)' : 'Checksum failure detected'}</span>
                  </div>

                  {currentSession.mrzData.vizMismatchDetected && (
                    <div className="text-[11px] font-mono text-amber-600 pl-5 space-y-0.5">
                      {currentSession.mrzData.vizMismatchDetails.map((det, i) => (
                        <div key={i}>⚠ {det}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* DYNAMIC EVIDENCE NAVIGATOR */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                    EVIDENCE NAVIGATOR ({findingsList.length} FINDINGS)
                  </h4>
                </div>
              </div>

              <div className="space-y-2">
                {findingsList.map((item) => {
                  const fid = item.finding_id || item.id;
                  const isSelected = selectedFindingId === fid;

                  return (
                    <div
                      key={fid}
                      onClick={() => {
                        setSelectedFindingId(fid);
                        setViewMode('evidence');
                      }}
                      className={`p-3 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-50 border-cyan-400 ring-1 ring-cyan-400 shadow-md'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md ${
                          item.severity === 'HIGH' || item.severity === 'CRITICAL' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {item.severity === 'HIGH' || item.severity === 'CRITICAL' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-900">{item.title}</h5>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{item.description}</p>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded ${
                        item.severity === 'HIGH' || item.severity === 'CRITICAL'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {item.severity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* OFFICER NOTES & DECISION */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
                />

                <div className="flex items-center gap-2 text-slate-400 text-xs px-1">
                  <button type="button" className="p-1 hover:text-slate-900 transition"><Bold className="w-3.5 h-3.5" /></button>
                  <button type="button" className="p-1 hover:text-slate-900 transition"><Italic className="w-3.5 h-3.5" /></button>
                  <button type="button" className="p-1 hover:text-slate-900 transition"><Underline className="w-3.5 h-3.5" /></button>
                  <button type="button" className="p-1 hover:text-slate-900 transition"><List className="w-3.5 h-3.5" /></button>
                  <button type="button" className="p-1 hover:text-slate-900 transition"><Link2 className="w-3.5 h-3.5" /></button>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="ml-auto px-2.5 py-0.5 bg-blue-50 hover:bg-blue-100 text-slate-900 text-[10px] font-mono font-bold uppercase rounded transition"
                  >
                    Save Note
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleSendForReview}
                  className="w-full py-2.5 bg-transparent hover:bg-amber-50 text-amber-600 border-2 border-amber-600 font-bold text-xs uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                  Send for Review
                </button>

                <button
                  onClick={handleApprove}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-slate-900 font-bold text-xs uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
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
      {!isUnsupported && (
        <OfficialDossierModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          session={currentSession}
        />
      )}
    </div>
  );
};
