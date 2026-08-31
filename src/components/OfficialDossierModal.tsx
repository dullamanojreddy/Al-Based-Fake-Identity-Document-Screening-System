import React, { useRef } from 'react';
import { X, Printer, Download, ShieldCheck, ShieldAlert, AlertOctagon, QrCode } from 'lucide-react';
import { ScreeningSession } from '../types';

interface OfficialDossierModalProps {
  session: ScreeningSession | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OfficialDossierModal: React.FC<OfficialDossierModalProps> = ({
  session,
  isOpen,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !session) return null;

  const handlePrint = () => {
    window.print();
  };

  const {
    id,
    checkpointId,
    checkpointName,
    officerBadge,
    officerName,
    timestamp,
    travelerName,
    travelerNationality,
    travelerDob,
    travelerPassportNumber,
    documentType,
    fields,
    mrzData,
    tampering,
    biometrics,
    watchlist,
    risk,
    status,
  } = session;

  const isClear = risk.riskTier === 'CLEAR';
  const isSecondary = risk.riskTier === 'SECONDARY_REVIEW';
  const isDetain = risk.riskTier === 'DETAIN_ALERT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full my-8 overflow-hidden shadow-2xl flex flex-col text-slate-900">
        {/* Top Modal Controls */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">🇮🇳</span>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Official Border Security Screening Dossier
              </h3>
              <p className="text-xs text-slate-400">Case ID: {id} | {checkpointId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Printable Report Container (Styled for White Print / Official Document Format) */}
        <div ref={printRef} className="p-8 bg-white text-slate-900 overflow-y-auto max-h-[75vh] font-sans">
          {/* Header Banner */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-slate-900 flex items-center justify-center text-2xl font-serif font-black bg-amber-50">
                🇮🇳
              </div>
              <div>
                <h1 className="text-xl font-black uppercase tracking-wider text-slate-950">
                  GOVERNMENT OF INDIA • MINISTRY OF HOME AFFAIRS
                </h1>
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                  SASHASTRA SEEMA BAL (SSB) • POLICE II DIVISION
                </h2>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  AI-BASED FAKE IDENTITY &amp; DOCUMENT FORENSIC SCREENING CERTIFICATE
                </p>
              </div>
            </div>

            <div className="text-right font-mono text-xs">
              <div className="border border-slate-300 p-2 rounded bg-slate-50">
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Document Serial</span>
                <span className="font-bold text-slate-900">{id}</span>
                <span className="block text-[10px] text-slate-500 uppercase font-bold mt-1">Date &amp; Time</span>
                <span>{new Date(timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Screening Decision Stamp */}
          <div className="mb-6 p-4 rounded-xl border-2 flex items-center justify-between bg-slate-50 border-slate-300">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Primary Checkpoint Disposition:
              </span>
              <span className={`text-xl font-black tracking-wide ${isClear ? 'text-emerald-700' : isSecondary ? 'text-amber-700' : 'text-red-700'}`}>
                {isClear && 'CLEAR — PASSED AUTOMATED E-GATE SCREENING'}
                {isSecondary && 'SECONDARY INSPECTION — MANUAL PHYSICAL VERIFICATION'}
                {isDetain && 'DETAIN & SEIZE — FORGERY / WATCHLIST ALERT'}
              </span>
              <p className="text-xs text-slate-700 mt-1 font-medium">{risk.recommendedAction}</p>
            </div>

            <div className="text-center font-mono">
              <div className={`px-4 py-2 rounded-xl font-black text-2xl border-2 ${
                isClear ? 'bg-emerald-100 border-emerald-500 text-emerald-800' : isSecondary ? 'bg-amber-100 border-amber-500 text-amber-800' : 'bg-red-100 border-red-500 text-red-800'
              }`}>
                RISK: {risk.overallRiskScore}/100
              </div>
            </div>
          </div>

          {/* Traveler & Checkpoint Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/60">
              <h4 className="font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
                Traveler Identity Profile
              </h4>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="py-1 text-slate-500 font-medium">Full Name:</td>
                    <td className="py-1 font-bold text-slate-900 font-mono">{travelerName}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-500 font-medium">Nationality / Code:</td>
                    <td className="py-1 font-bold text-slate-900 font-mono">{travelerNationality}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-500 font-medium">Passport / ID No.:</td>
                    <td className="py-1 font-bold text-slate-900 font-mono">{travelerPassportNumber}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-500 font-medium">Date of Birth:</td>
                    <td className="py-1 font-bold text-slate-900">{travelerDob}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-500 font-medium">Document Type:</td>
                    <td className="py-1 font-bold text-slate-900 uppercase">{documentType.replace('_', ' ')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/60">
              <h4 className="font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
                Checkpoint Station &amp; Officer Log
              </h4>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="py-1 text-slate-500 font-medium">Station ID:</td>
                    <td className="py-1 font-bold text-slate-900 font-mono">{checkpointId}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-500 font-medium">Location:</td>
                    <td className="py-1 font-bold text-slate-900">{checkpointName}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-500 font-medium">Officer-in-Charge:</td>
                    <td className="py-1 font-bold text-slate-900">{officerName}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-500 font-medium">Officer Badge ID:</td>
                    <td className="py-1 font-bold text-slate-900 font-mono">{officerBadge}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-500 font-medium">AI Verification Engine:</td>
                    <td className="py-1 font-bold text-cyan-800">Gemini Vision Forensics v2.5 + ICAO 9303</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Module-by-Module Technical Audit Log */}
          <div className="space-y-4 mb-6 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1">
              4-Module Screening Findings &amp; Forensic Analysis
            </h4>

            {/* Module 1 & 2 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-lg p-3">
                <span className="font-bold block text-slate-800 mb-1">Module 1: OCR Data Extraction</span>
                <p className="text-slate-600">
                  Total fields parsed: <strong>{fields.length}</strong>. Average optical confidence score: <strong>{risk.breakdown.ocrExtractionScore}%</strong>.
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-3">
                <span className="font-bold block text-slate-800 mb-1">Module 2: ICAO 9303 MRZ Engine</span>
                <p className="text-slate-600">
                  MRZ Checksums: <strong className={mrzData?.isAllChecksumsValid ? 'text-emerald-700' : 'text-red-700'}>{mrzData?.isAllChecksumsValid ? 'VALID (7-3-1 Weight Match)' : 'CHECKSUM FAILURE'}</strong>.
                  {mrzData?.vizMismatchDetected && (
                    <span className="block text-red-700 font-bold mt-1">⚠ VIZ-to-MRZ Mismatch Detected!</span>
                  )}
                </p>
              </div>
            </div>

            {/* Module 3 & 4 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-lg p-3">
                <span className="font-bold block text-slate-800 mb-1">Module 3: Tampering &amp; Splicing Forensics</span>
                <p className="text-slate-600">
                  Tamper Index: <strong className={tampering.isTampered ? 'text-red-700' : 'text-emerald-700'}>{tampering.overallTamperScore}%</strong>.
                  Photo Splicing: <strong>{tampering.photoReplacement.detected ? 'DETECTED' : 'CLEAR'}</strong>.
                  Stamp Integrity: <strong>{tampering.stampForgery.detected ? 'FORGED' : 'INTACT'}</strong>.
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-3">
                <span className="font-bold block text-slate-800 mb-1">Module 4: Facial Biometrics &amp; Watchlist</span>
                <p className="text-slate-600">
                  Biometric Match: <strong>{biometrics?.similarityScore || 0}% ({biometrics?.matchStatus})</strong>.
                  Interpol/SSB Watchlist: <strong className={watchlist.isHit ? 'text-red-700' : 'text-emerald-700'}>{watchlist.isHit ? `HIT (${watchlist.threatLevel})` : 'CLEAR'}</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Signatures & Authentication Stamp */}
          <div className="border-t-2 border-slate-900 pt-6 mt-8 flex items-end justify-between text-xs">
            <div>
              <div className="w-20 h-20 border border-slate-400 rounded-lg flex flex-col items-center justify-center text-slate-400">
                <QrCode className="w-12 h-12 text-slate-700" />
                <span className="text-[8px] font-mono mt-0.5">VERIFY DIGITALLY</span>
              </div>
            </div>

            <div className="text-center">
              <div className="w-28 h-12 border-b-2 border-slate-400 mb-1 flex items-center justify-center text-slate-400 font-serif italic">
                {officerName.split(' ')[1]}
              </div>
              <span className="font-bold block text-slate-800">Inspecting Officer Sign</span>
              <span className="text-[10px] text-slate-500 font-mono">{officerBadge}</span>
            </div>

            <div className="text-right text-[10px] text-slate-500 max-w-xs">
              <p>Certified under Sashastra Seema Bal Immigration &amp; Border Checkpoint Surveillance Framework. Cryptographically hashed digital audit trail.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
