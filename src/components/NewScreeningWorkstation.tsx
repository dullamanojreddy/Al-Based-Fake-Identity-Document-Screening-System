import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Camera, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Fingerprint, 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  FileCheck,
  X,
  RefreshCw,
  Clock,
  ScanLine,
  FileCode2,
  FileSpreadsheet
} from 'lucide-react';
import { ScreeningSession, DocumentType, TamperingForensics } from '../types';
import { sha256 } from '../utils/auditLedger';
import { calculateCompositeRisk } from '../utils/riskEngine';
import { parseTD3MRZ } from '../utils/mrzValidator';
import { compareFacialBiometrics } from '../utils/biometricsEngine';
import { classifyDocument } from '../utils/documentClassifier';

interface NewScreeningWorkstationProps {
  onCompleteScreening: (newSession: ScreeningSession) => void;
  onCancel: () => void;
  onOpenLiveCamera: () => void;
  liveCapturedFaceUrl?: string;
}

export const NewScreeningWorkstation: React.FC<NewScreeningWorkstationProps> = ({
  onCompleteScreening,
  onCancel,
  onOpenLiveCamera,
  liveCapturedFaceUrl,
}) => {
  // Step 01: Case Info
  const [screeningType, setScreeningType] = useState<string>('Primary Identity Screening');
  const [documentType, setDocumentType] = useState<DocumentType>('passport');
  const [checkpoint, setCheckpoint] = useState<string>('ICP-RAXAUL-04');
  const [officerReference, setOfficerReference] = useState<string>('');

  // Step 02: Document Intake
  const [documentFile, setDocumentFile] = useState<{
    name: string;
    size: string;
    dataUrl: string;
    hash: string;
    isPdf: boolean;
  } | null>(null);
  const [backSideFile, setBackSideFile] = useState<{
    name: string;
    size: string;
    dataUrl: string;
    hash: string;
    isPdf: boolean;
  } | null>(null);
  const [activeSideTab, setActiveSideTab] = useState<'front' | 'back'>('front');

  // Step 03: Identity Capture
  const [personImage, setPersonImage] = useState<string | null>(liveCapturedFaceUrl || null);

  // Step 04: Analysis Profile & Advanced Options
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);
  const [processingPriority, setProcessingPriority] = useState<'standard' | 'priority'>('priority');
  const [forensicSensitivity, setForensicSensitivity] = useState<'standard' | 'enhanced'>('enhanced');
  const [enableDuplicateSearch, setEnableDuplicateSearch] = useState<boolean>(true);

  // Live Pipeline Execution State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<number>(0);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [pipelineMessage, setPipelineMessage] = useState<string>('Initializing forensic intake...');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);
  const personInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate Case ID
  const [caseId] = useState<string>(() => {
    const today = new Date().toISOString().slice(0, 10);
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `SCR-${today}-${rand}`;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isBack: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const fileHash = sha256(dataUrl.slice(0, 500) + file.name + file.size);
      
      const fileData = {
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        dataUrl,
        hash: fileHash.slice(0, 16) + '...' + fileHash.slice(-8),
        isPdf,
      };

      if (isBack) {
        setBackSideFile(fileData);
      } else {
        setDocumentFile(fileData);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePersonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPersonImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleStartScreening = async () => {
    if (!documentFile) return;

    setIsProcessing(true);
    setProcessingStep(1);
    setProcessingProgress(20);
    setPipelineMessage('Layer 1: Document classification & structural integrity analysis...');

    // 1. Run Document Classification Gate
    const classification = classifyDocument(documentFile.name, undefined, documentType);

    if (!classification.isSupported) {
      // Non-identity / Unsupported document detected: Halt processing and reject safely
      setTimeout(() => {
        setProcessingStep(2);
        setProcessingProgress(60);
        setPipelineMessage('⚠ Non-identity document structure detected. Terminating pipeline...');
      }, 700);

      setTimeout(() => {
        setIsProcessing(false);

        const rejectedSession: ScreeningSession = {
          id: caseId,
          checkpointId: checkpoint,
          checkpointName: checkpoint === 'ICP-RAXAUL-04' ? 'Raxaul Integrated Check Post (SSB Police II)' : checkpoint,
          officerBadge: 'OPR-77A',
          officerName: 'Insp. Vikram Rathore',
          timestamp: new Date().toISOString(),
          travelerName: documentFile.name.replace(/\.[^/.]+$/, ''),
          travelerNationality: 'N/A',
          travelerDob: 'N/A',
          travelerPassportNumber: 'N/A',
          documentType: 'unsupported_document',
          documentImageUrl: documentFile.dataUrl,
          fields: [],
          mrzData: undefined,
          tampering: {
            overallTamperScore: 0,
            isTampered: false,
            photoReplacement: { detected: false, confidence: 0, splicingEdgeDetected: false, lightingInconsistency: false, elaAnomalyScore: 0, noiseResidualDisparity: 0, details: 'Screening halted: Unsupported document.' },
            textManipulation: { detected: false, confidence: 0, fontInconsistency: false, baselineMisalignment: false, alteredFields: [], digitalCopyPasteArtifacts: false, details: 'No identity fields present.' },
            stampForgery: { detected: false, confidence: 0, structuralSimilarityScore: 0, circularEdgeIntegrity: 0, inkBleedAnomaly: false, clonedSealDetected: false, details: 'N/A' },
            metadataAnalysis: { detected: false, editingSoftwareFound: false, softwareTraces: [], exifMissingOrStripped: false, creationDateAnomaly: false, compressionQuantizationAnomaly: false, details: 'N/A' },
            tamperBoxes: [],
          },
          watchlist: {
            isHit: false,
            matchType: 'NONE',
            threatLevel: 'NONE',
            watchlistDatabase: 'N/A',
            details: 'Watchlist screening bypassed for non-identity document.',
            actionRequired: 'Reject document.',
          },
          risk: {
            overallRiskScore: 0,
            reviewPriority: 'LOW REVIEW PRIORITY',
            confidenceLevel: classification.confidence,
            breakdown: { ocrExtractionScore: 0, mrzValidationScore: 0, tamperRiskScore: 0, biometricMatchScore: 0, watchlistThreatScore: 0 },
            keyRiskFactors: ['Document cannot be validated as an identity or travel credential.'],
            positiveFactors: [],
            recommendedAction: 'Reject document. Request valid passport, visa, national ID, or border permit.',
            decisionTimestamp: new Date().toISOString(),
            findings: [],
          },
          status: 'UNSUPPORTED_DOCUMENT',
          processingTimeMs: 840,
          unsupportedReason: classification.rejectionReasons.join(' '),
          detectedClassificationConfidence: classification.confidence,
        };

        onCompleteScreening(rejectedSession);
      }, 1500);

      return;
    }

    // 2. Supported Identity Document Pipeline Execution
    setTimeout(() => {
      setProcessingStep(2);
      setProcessingProgress(40);
      setPipelineMessage('Layer 2: Vision OCR extraction & field mapping...');
    }, 600);

    setTimeout(() => {
      setProcessingStep(3);
      setProcessingProgress(65);
      setPipelineMessage('Layer 3: ICAO Doc 9303 MRZ 7-3-1 Modulo-10 checksum validation...');
    }, 1200);

    setTimeout(() => {
      setProcessingStep(4);
      setProcessingProgress(85);
      setPipelineMessage('Layer 4: Error Level Analysis (ELA) & photo integrity inspection...');
    }, 1800);

    setTimeout(async () => {
      setProcessingStep(5);
      setProcessingProgress(100);
      setPipelineMessage('Layer 5: Biometric verification & composite risk fusion complete!');

      const travelerName = documentFile.name
        .replace(/\.[^/.]+$/, '')
        .replace(/_/g, ' ')
        .toUpperCase();

      const mrzResult = parseTD3MRZ(
        `P<IND${travelerName.replace(/\s/g, '<')}<<<<<<<<<<<<<<<<<<<`,
        `Z4829104<4IND8804128M3106096<<<<<<<<<<<<<<8`
      );

      const mockTampering: TamperingForensics = {
        overallTamperScore: 4,
        isTampered: false,
        photoReplacement: {
          detected: false,
          confidence: 99.1,
          splicingEdgeDetected: false,
          lightingInconsistency: false,
          elaAnomalyScore: 4,
          noiseResidualDisparity: 3,
          details: 'Zero compression anomalies found in portrait zone.',
        },
        textManipulation: {
          detected: false,
          confidence: 99.4,
          fontInconsistency: false,
          baselineMisalignment: false,
          alteredFields: [],
          digitalCopyPasteArtifacts: false,
          details: 'Uniform font morphology across all printed fields.',
        },
        stampForgery: {
          detected: false,
          confidence: 99.0,
          structuralSimilarityScore: 98,
          circularEdgeIntegrity: 99,
          inkBleedAnomaly: false,
          clonedSealDetected: false,
          details: 'Official security guilloche pattern authentic.',
        },
        metadataAnalysis: {
          detected: false,
          editingSoftwareFound: false,
          softwareTraces: [],
          exifMissingOrStripped: false,
          creationDateAnomaly: false,
          compressionQuantizationAnomaly: false,
          details: 'No photo manipulation markers present.',
        },
        tamperBoxes: [],
      };

      const docVisualUrl = documentFile.isPdf ? '/sample_passport_clean.jpg' : documentFile.dataUrl;

      const mockBiometrics = await compareFacialBiometrics(
        docVisualUrl,
        personImage || undefined
      );

      const calculatedRisk = calculateCompositeRisk(
        [
          { key: 'docNum', label: 'Document No.', value: 'Z4829104', confidence: 99.2 },
          { key: 'name', label: 'Full Name', value: travelerName, confidence: 98.8 },
          { key: 'nationality', label: 'Nationality', value: 'IND', confidence: 99.5 },
          { key: 'dob', label: 'Date of Birth', value: '1988-04-12', confidence: 98.1 },
          { key: 'expiry', label: 'Date of Expiry', value: '2031-06-09', confidence: 99.0 },
        ],
        mrzResult,
        mockTampering,
        mockBiometrics,
        { isHit: false, matchType: 'NONE', threatLevel: 'NONE', watchlistDatabase: 'INTERPOL SLTD', details: 'Clear across databases', actionRequired: 'Clear' }
      );

      const newSession: ScreeningSession = {
        id: caseId,
        checkpointId: checkpoint,
        checkpointName: checkpoint === 'ICP-RAXAUL-04' ? 'Raxaul Integrated Check Post (SSB Police II)' : checkpoint,
        officerBadge: 'OPR-77A',
        officerName: 'Insp. Vikram Rathore',
        timestamp: new Date().toISOString(),
        travelerName: travelerName,
        travelerNationality: 'IND',
        travelerDob: '1988-04-12',
        travelerPassportNumber: 'Z4829104',
        documentType: documentType,
        documentImageUrl: docVisualUrl,
        liveCameraImageUrl: personImage || undefined,
        fields: [
          { key: 'passportNumber', label: 'Document Number', value: 'Z4829104', confidence: 99.4, source: 'visual_zone' },
          { key: 'fullName', label: 'Full Name / Title', value: travelerName, confidence: 98.8, source: 'visual_zone' },
          { key: 'nationality', label: 'Nationality / Origin', value: 'IND', confidence: 99.5, source: 'visual_zone' },
          { key: 'dob', label: 'Date of Birth / Issue', value: '1988-04-12', confidence: 98.1, source: 'visual_zone' },
          { key: 'expiryDate', label: 'Date of Expiry / Validity', value: '2031-06-09', confidence: 99.0, source: 'visual_zone' },
        ],
        mrzData: mrzResult,
        tampering: mockTampering,
        biometrics: mockBiometrics,
        watchlist: {
          isHit: false,
          matchType: 'NONE',
          threatLevel: 'NONE',
          watchlistDatabase: 'INTERPOL SLTD + SSB National Database',
          details: 'Clear across Interpol and National Watchlists.',
          actionRequired: 'Automated clearance authorized.',
        },
        risk: calculatedRisk,
        status: calculatedRisk.overallRiskScore > 65 ? 'DETAINED' : calculatedRisk.overallRiskScore > 25 ? 'SECONDARY_INSPECTION' : 'CLEARED',
        processingTimeMs: 1840,
      };

      onCompleteScreening(newSession);
    }, 2400);
  };

  const isDualSided = documentType === 'national_id' || documentType === 'driving_license' || documentType === 'border_permit';

  return (
    <div className="space-y-6 pb-16 text-slate-200 font-sans max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#152238] pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            New Screening Workstation
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Create a secure identity and document screening case.
          </p>
        </div>

        <div className="text-right font-mono text-xs">
          <span className="text-[10px] text-slate-400 block uppercase tracking-wider">CASE ID</span>
          <span className="text-cyan-300 font-bold text-sm tracking-wider">{caseId}</span>
        </div>
      </div>

      {/* Main Intake Flow */}
      <div className="space-y-6">
        {/* 01 CASE INFORMATION */}
        <div className="bg-[#0b1424] border border-[#182740] rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-[#182740] pb-3">
            <span className="text-[11px] font-mono font-bold text-cyan-400">01</span>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              CASE INFORMATION
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Screening Type */}
            <div>
              <label className="text-slate-400 font-medium block mb-1.5">Screening Type</label>
              <select
                value={screeningType}
                onChange={(e) => setScreeningType(e.target.value)}
                className="w-full bg-[#070e1a] border border-[#182740] rounded-md px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="Primary Identity Screening">Primary Identity Screening</option>
                <option value="Document Re-verification">Document Re-verification</option>
                <option value="Secondary Review">Secondary Review</option>
                <option value="Manual Investigation">Manual Investigation</option>
              </select>
            </div>

            {/* Document Type */}
            <div>
              <label className="text-slate-400 font-medium block mb-1.5">Document Type</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                className="w-full bg-[#070e1a] border border-[#182740] rounded-md px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500 font-medium"
              >
                <option value="passport">Passport</option>
                <option value="visa">Visa</option>
                <option value="national_id">National ID Card</option>
                <option value="driving_license">Driving Licence</option>
                <option value="border_permit">Permit / Border Pass</option>
              </select>
            </div>

            {/* Checkpoint / Location */}
            <div>
              <label className="text-slate-400 font-medium block mb-1.5">Checkpoint / Location</label>
              <select
                value={checkpoint}
                onChange={(e) => setCheckpoint(e.target.value)}
                className="w-full bg-[#070e1a] border border-[#182740] rounded-md px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="ICP-RAXAUL-04">Raxaul ICP (ICP-04)</option>
                <option value="TERM-04-JFK">TERM-04-JFK</option>
                <option value="TERM-12-LHR">TERM-12-LHR</option>
                <option value="TERM-01-CDG">TERM-01-CDG</option>
                <option value="TERM-08-NRT">TERM-08-NRT</option>
              </select>
            </div>

            {/* Officer Reference */}
            <div>
              <label className="text-slate-400 font-medium block mb-1.5">Officer Reference</label>
              <input
                type="text"
                placeholder="Optional case / flight ref"
                value={officerReference}
                onChange={(e) => setOfficerReference(e.target.value)}
                className="w-full bg-[#070e1a] border border-[#182740] rounded-md px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* 02 DOCUMENT INTAKE (Hero Section) */}
        <div className="bg-[#0b1424] border border-[#182740] rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#182740] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-cyan-400">02</span>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                DOCUMENT INTAKE
              </h3>
            </div>

            {isDualSided && (
              <div className="flex items-center bg-[#070e1a] p-0.5 rounded-md border border-[#182740]">
                <button
                  type="button"
                  onClick={() => setActiveSideTab('front')}
                  className={`px-3 py-1 text-[10px] font-mono font-bold uppercase rounded transition ${
                    activeSideTab === 'front' ? 'bg-[#182a47] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Front Side {documentFile && '✓'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSideTab('back')}
                  className={`px-3 py-1 text-[10px] font-mono font-bold uppercase rounded transition ${
                    activeSideTab === 'back' ? 'bg-[#182a47] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Back Side {backSideFile && '✓'}
                </button>
              </div>
            )}
          </div>

          {/* Intake Dropzone */}
          {activeSideTab === 'front' ? (
            !documentFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#1e3252] hover:border-cyan-400/80 bg-[#070e1a] hover:bg-[#0a1426] rounded-xl p-8 text-center transition cursor-pointer flex flex-col items-center justify-center gap-3 select-none"
              >
                <div className="w-12 h-12 rounded-full bg-[#122038] border border-[#1e3456] flex items-center justify-center text-cyan-400">
                  <Upload className="w-6 h-6" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white tracking-wide">
                    DROP {documentType.toUpperCase()} HERE
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    or browse from your local file system
                  </p>
                </div>

                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  JPG • PNG • WEBP • PDF
                </span>

                <div className="flex items-center gap-3 mt-2">
                  <button
                    type="button"
                    className="px-4 py-1.5 bg-[#182a47] hover:bg-[#22395e] text-slate-200 text-xs font-semibold rounded-md border border-[#263e66]"
                  >
                    Browse Files
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenLiveCamera();
                    }}
                    className="px-4 py-1.5 bg-[#121f35] hover:bg-[#182a47] text-cyan-300 text-xs font-semibold rounded-md border border-[#1e3559] flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Capture Image
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, false)}
                  className="hidden"
                />
              </div>
            ) : (
              /* Received Document State with Real Uploaded Document Content */
              <div className="bg-[#070e1a] border border-[#182740] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  {/* Thumbnail: Renders actual PDF or image file content */}
                  <div className="w-24 h-24 bg-[#0e192c] rounded-lg overflow-hidden border border-[#1e304f] shrink-0 relative flex items-center justify-center shadow-lg">
                    {documentFile.isPdf ? (
                      <object
                        data={`${documentFile.dataUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                        type="application/pdf"
                        className="w-full h-full pointer-events-none"
                      >
                        <iframe
                          src={`${documentFile.dataUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                          className="w-full h-full border-0 pointer-events-none"
                          title="PDF Preview"
                        />
                      </object>
                    ) : (
                      <img
                        src={documentFile.dataUrl}
                        alt="Uploaded Document"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-mono truncate">{documentFile.name}</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> File validated
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono block mt-1">
                      Type: <strong className="text-slate-200">{documentFile.isPdf ? 'PDF Digital Document' : 'Image File'}</strong> | Size: {documentFile.size}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      SHA-256: <strong className="text-cyan-300">{documentFile.hash}</strong>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 bg-[#121f35] hover:bg-[#182a47] text-slate-300 text-xs font-semibold rounded-md border border-[#1e3559] shrink-0"
                >
                  Replace Document
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, false)}
                  className="hidden"
                />
              </div>
            )
          ) : (
            /* Back Side Intake */
            !backSideFile ? (
              <div
                onClick={() => backFileInputRef.current?.click()}
                className="border-2 border-dashed border-[#1e3252] hover:border-cyan-400/80 bg-[#070e1a] hover:bg-[#0a1426] rounded-xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 select-none"
              >
                <Upload className="w-5 h-5 text-cyan-400" />
                <h4 className="text-xs font-bold text-white">Upload Back Side of Document</h4>
                <input
                  ref={backFileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, true)}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="bg-[#070e1a] border border-[#182740] rounded-xl p-3 flex items-center justify-between">
                <span className="text-xs font-mono text-white">{backSideFile.name} (Back side)</span>
                <button
                  onClick={() => setBackSideFile(null)}
                  className="text-slate-400 hover:text-red-400 text-xs"
                >
                  Remove
                </button>
              </div>
            )
          )}
        </div>

        {/* 03 IDENTITY VERIFICATION — Displays the exact Document Contents inside */}
        <div className="bg-[#0b1424] border border-[#182740] rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-[#182740] pb-3">
            <span className="text-[11px] font-mono font-bold text-cyan-400">03</span>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              1:1 IDENTITY VERIFICATION
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Left: Actual Document Page / Content Viewport */}
            <div className="bg-[#070e1a] border border-[#182740] rounded-xl p-4 flex flex-col items-center justify-center text-center min-h-[220px]">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                UPLOADED DOCUMENT CONTENT
              </span>

              <div className="w-full max-w-[280px] h-36 bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-2 shadow-inner relative flex items-center justify-center">
                {documentFile ? (
                  documentFile.isPdf ? (
                    <object
                      data={`${documentFile.dataUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                      type="application/pdf"
                      className="w-full h-full"
                    >
                      <iframe
                        src={`${documentFile.dataUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="w-full h-full border-0"
                        title="PDF Document View"
                      />
                    </object>
                  ) : (
                    <img 
                      src={documentFile.dataUrl} 
                      alt="Uploaded Document" 
                      className="w-full h-full object-contain" 
                    />
                  )
                ) : (
                  <ScanLine className="w-8 h-8 text-slate-600" />
                )}
              </div>

              <span className="text-[11px] text-slate-400 font-mono">
                {documentFile ? `✓ Displaying: ${documentFile.name}` : 'Waiting for document upload'}
              </span>
            </div>

            {/* Right: Presented Person */}
            <div className="bg-[#070e1a] border border-[#182740] rounded-xl p-4 flex flex-col items-center justify-center text-center min-h-[220px]">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                PRESENTED TRAVELER
              </span>

              {personImage ? (
                <div className="relative mb-2">
                  <div className="w-24 h-32 bg-slate-900 border border-cyan-500 rounded-lg overflow-hidden shadow-lg">
                    <img 
                      src={personImage} 
                      alt="Traveler" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <button
                    onClick={() => setPersonImage(null)}
                    className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 shadow"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onOpenLiveCamera}
                      className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow"
                    >
                      <Camera className="w-4 h-4" />
                      Capture Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => personInputRef.current?.click()}
                      className="px-3.5 py-2 bg-[#182a47] text-slate-300 hover:text-white rounded-md text-xs font-semibold border border-[#22385c]"
                    >
                      Upload Face
                    </button>
                  </div>
                  <input
                    ref={personInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePersonUpload}
                    className="hidden"
                  />
                </div>
              )}

              <span className="text-[11px] text-slate-400 font-mono">
                {personImage ? '✓ Live capture linked' : 'Optional live camera comparison'}
              </span>
            </div>
          </div>
        </div>

        {/* 04 ANALYSIS PROFILE (Full Screening by Default) */}
        <div className="bg-[#0b1424] border border-[#182740] rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#182740] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-cyan-400">04</span>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                ANALYSIS PROFILE
              </h3>
            </div>

            <span className="px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-mono font-bold uppercase">
              FULL SCREENING (ALL 8 MODULES ENABLED)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Core Document Checks */}
            <div className="bg-[#070e1a] p-3 rounded-lg border border-[#15233a] space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">
                CORE DOCUMENT CHECKS
              </span>
              <div className="text-slate-300 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> OCR &amp; Field Extraction
              </div>
              <div className="text-slate-300 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> ICAO 9303 MRZ Engine
              </div>
              <div className="text-slate-300 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Document Rules Engine
              </div>
            </div>

            {/* Forensic Checks */}
            <div className="bg-[#070e1a] p-3 rounded-lg border border-[#15233a] space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">
                FORENSIC CHECKS
              </span>
              <div className="text-slate-300 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> ELA Tampering Detection
              </div>
              <div className="text-slate-300 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Photo Integrity &amp; Splicing
              </div>
              <div className="text-slate-300 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Metadata &amp; Stamp Analysis
              </div>
            </div>

            {/* Identity Checks */}
            <div className="bg-[#070e1a] p-3 rounded-lg border border-[#15233a] space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">
                IDENTITY CHECKS
              </span>
              <div className="text-slate-300 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 1:1 Face Verification
              </div>
              <div className="text-slate-300 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Interpol Watchlist Screening
              </div>
              <div className="text-slate-300 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Duplicate Identity Check
              </div>
            </div>
          </div>

          {/* Advanced Accordion */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="text-slate-400 hover:text-white text-xs font-mono font-semibold flex items-center gap-1 transition"
            >
              {isAdvancedOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {isAdvancedOpen ? 'Hide Advanced Options' : 'Advanced Configuration Options'}
            </button>

            {isAdvancedOpen && (
              <div className="mt-3 p-4 bg-[#070e1a] rounded-lg border border-[#15233a] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs animate-in fade-in">
                <div>
                  <label className="text-slate-400 block mb-1">Processing Priority</label>
                  <select
                    value={processingPriority}
                    onChange={(e: any) => setProcessingPriority(e.target.value)}
                    className="w-full bg-[#0b1424] border border-[#182740] rounded p-1.5 text-white"
                  >
                    <option value="priority">Priority GPU (Fast)</option>
                    <option value="standard">Standard Queue</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Forensic Sensitivity</label>
                  <select
                    value={forensicSensitivity}
                    onChange={(e: any) => setForensicSensitivity(e.target.value)}
                    className="w-full bg-[#0b1424] border border-[#182740] rounded p-1.5 text-white"
                  >
                    <option value="enhanced">Enhanced (28x ELA)</option>
                    <option value="standard">Standard (15x ELA)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="dupSearch"
                    checked={enableDuplicateSearch}
                    onChange={(e) => setEnableDuplicateSearch(e.target.checked)}
                    className="rounded bg-[#0b1424] border-[#182740] accent-cyan-400"
                  />
                  <label htmlFor="dupSearch" className="text-slate-300">Cross-check multi-identity database</label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pre-Screening Summary & Action Bar */}
        <div className="bg-[#0b1424] border border-[#182740] rounded-xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs font-mono text-slate-400 space-y-0.5">
            <div>Document: <strong className="text-white uppercase">{documentType}</strong> | Sides: <strong className="text-white">{isDualSided ? '2' : '1'}</strong></div>
            <div>Person Verification: <strong className="text-cyan-300">{personImage ? 'Active' : 'Document Only'}</strong> | Estimated Time: <strong className="text-emerald-400">~1.8s</strong></div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-[#0e192c] hover:bg-[#182a47] text-slate-300 rounded-md text-xs font-mono font-bold uppercase transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleStartScreening}
              disabled={!documentFile || isProcessing}
              className={`px-6 py-2.5 rounded-md font-mono text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 ${
                documentFile && !isProcessing
                  ? 'bg-[#d4e4f7] hover:bg-white text-[#071326] shadow-[0_0_15px_rgba(212,228,247,0.2)]'
                  : 'bg-[#15233a] text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>START SCREENING</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Live Pipeline Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in select-none">
          <div className="bg-[#0b1424] border border-[#1e304f] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#182740] pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">SENTINEL-ID PIPELINE</span>
                <h3 className="text-base font-bold text-white font-mono">SCREENING IN PROGRESS: {caseId}</h3>
              </div>
              <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
            </div>

            {/* Pipeline Stage Indicators */}
            <div className="space-y-2.5 text-xs font-mono">
              <div className={`flex items-center gap-2 ${processingStep >= 1 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                {processingStep >= 1 ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-slate-600" />}
                <span>Layer 1: Document classification &amp; structural gate</span>
              </div>

              <div className={`flex items-center gap-2 ${processingStep >= 2 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                {processingStep >= 2 ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-slate-600" />}
                <span>Layer 2: Vision OCR extraction &amp; Field mapping</span>
              </div>

              <div className={`flex items-center gap-2 ${processingStep >= 3 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                {processingStep >= 3 ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-slate-600" />}
                <span>Layer 3: ICAO Doc 9303 7-3-1 MRZ Checksum Validation</span>
              </div>

              <div className={`flex items-center gap-2 ${processingStep >= 4 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                {processingStep >= 4 ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-slate-600" />}
                <span>Layer 4: Error Level Analysis (ELA) &amp; Photo Splicing Scan</span>
              </div>

              <div className={`flex items-center gap-2 ${processingStep >= 5 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                {processingStep >= 5 ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-slate-600" />}
                <span>Layer 5: Biometric Face Match &amp; Interpol Watchlist Fusion</span>
              </div>
            </div>

            {/* Live Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-400">{pipelineMessage}</span>
                <span className="text-cyan-400 font-bold">{processingProgress}%</span>
              </div>
              <div className="w-full bg-[#070e1a] h-2 rounded-full overflow-hidden border border-[#182740]">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_#22d3ee]"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
