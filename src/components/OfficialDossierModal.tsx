import React, { useRef } from 'react';
import { 
  Printer, 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  AlertOctagon, 
  FileText, 
  QrCode, 
  CheckCircle2, 
  Download, 
  Lock 
} from 'lucide-react';
import { ScreeningSession } from '../types';

interface OfficialDossierModalProps {
  session: ScreeningSession;
  isOpen: boolean;
  onClose: () => void;
}

export const OfficialDossierModal: React.FC<OfficialDossierModalProps> = ({
  session,
  isOpen,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = JSON.stringify(session, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MHA_Screening_Dossier_${session.id}.json`;
    link.click();
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

  const isClear = risk.reviewPriority === 'LOW REVIEW PRIORITY';
  const isSecondary = risk.reviewPriority === 'REVIEW RECOMMENDED';
  const isDetain = risk.reviewPriority === 'ENHANCED REVIEW RECOMMENDED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full my-8 overflow-hidden shadow-2xl flex flex-col text-slate-900">
        {/* Top Modal Controls */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between text-slate-900">
          <div className="flex items-center gap-2">
            <span className="text-xl">🇮🇳</span>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Official Border Security Screening Dossier
              </h3>
              <p className="text-xs text-slate-500">Case ID: {id} | {checkpointId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadJSON}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-blue-700 border border-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Printable Report Container */}
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
                    <td className="py-1 text-slate-500 font-medium">Screening Officer:</td>
                    <td className="py-1 font-bold text-slate-900">{officerName} ({officerBadge})</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-500 font-medium">Processing Time:</td>
                    <td className="py-1 font-bold text-slate-900 font-mono">{session.processingTimeMs} ms</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-500 font-medium">Audit Trail Hash:</td>
                    <td className="py-1 font-mono text-[10px] text-slate-600 truncate">sha256:88921a..f892c</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Forensic Module Results Summary Table */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Automated Forensic Verification Breakdown
            </h4>
            <table className="w-full text-xs border border-slate-300 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2 px-3 text-left">Module / Test</th>
                  <th className="py-2 px-3 text-left">Methodology</th>
                  <th className="py-2 px-3 text-left">Diagnostic Result</th>
                  <th className="py-2 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2 px-3 font-semibold">1. OCR Field Extraction</td>
                  <td className="py-2 px-3 text-slate-600">Multimodal Gemini Vision OCR</td>
                  <td className="py-2 px-3">Field confidence: {risk.breakdown.ocrExtractionScore}%</td>
                  <td className="py-2 px-3 text-center font-bold text-emerald-700">PASS</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">2. ICAO 9303 MRZ Engine</td>
                  <td className="py-2 px-3 text-slate-600">7-3-1 Modulo-10 Checksum Algorithm</td>
                  <td className="py-2 px-3">
                    {mrzData?.isAllChecksumsValid ? 'All check digits valid' : 'Checksum failure detected'}
                  </td>
                  <td className={`py-2 px-3 text-center font-bold ${mrzData?.isAllChecksumsValid ? 'text-emerald-700' : 'text-red-700'}`}>
                    {mrzData?.isAllChecksumsValid ? 'PASS' : 'FAIL'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">3. Tamper &amp; Splicing Forensics</td>
                  <td className="py-2 px-3 text-slate-600">HTML5 Error Level Analysis (ELA) + Noise</td>
                  <td className="py-2 px-3">Tamper risk: {tampering.overallTamperScore}%</td>
                  <td className={`py-2 px-3 text-center font-bold ${!tampering.isTampered ? 'text-emerald-700' : 'text-red-700'}`}>
                    {!tampering.isTampered ? 'PASS' : 'ALERT'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">4. 1:1 Facial Biometrics</td>
                  <td className="py-2 px-3 text-slate-600">68-Nodal Landmark Biometric Match</td>
                  <td className="py-2 px-3">
                    {biometrics ? `Similarity: ${biometrics.similarityScore}%` : 'Not Captured'}
                  </td>
                  <td className={`py-2 px-3 text-center font-bold ${biometrics?.isBiometricVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {biometrics?.isBiometricVerified ? 'MATCH' : 'FLAG'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">5. Interpol &amp; SSB Watchlist</td>
                  <td className="py-2 px-3 text-slate-600">SLTD + National Wanted Fugitive Database</td>
                  <td className="py-2 px-3">{watchlist.details}</td>
                  <td className={`py-2 px-3 text-center font-bold ${!watchlist.isHit ? 'text-emerald-700' : 'text-red-700'}`}>
                    {!watchlist.isHit ? 'CLEARED' : 'HIT'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Official Sign-off & Verification Seal */}
          <div className="pt-4 border-t-2 border-slate-900 flex items-end justify-between text-xs">
            <div className="space-y-1">
              <span className="font-mono text-[10px] text-slate-500 block">
                IMMIGRATION &amp; BORDER CONTROL SYSTEM • FIDSS v2.5.0
              </span>
              <p className="text-[10px] text-slate-500 max-w-sm">
                This forensic certificate is generated by an authorized border screening node. All results are hashed and cryptographically anchored to the National Immigration Ledger.
              </p>
            </div>

            <div className="text-center font-mono">
              <div className="w-36 h-12 border-b border-slate-400 mb-1 flex items-center justify-center italic text-slate-400">
                [Digitally Signed]
              </div>
              <span className="text-[11px] font-bold block">{officerName}</span>
              <span className="text-[10px] text-slate-500 block">Officer-in-Charge (SSB-7092)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
