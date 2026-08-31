import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertOctagon, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Lock, 
  UserCheck, 
  FileWarning
} from 'lucide-react';
import { CompositeRiskAssessment, RiskTier } from '../types';

interface RiskScoreCardProps {
  risk: CompositeRiskAssessment;
  onClearDocument?: () => void;
  onFlagSecondary?: () => void;
  onDetainSubject?: () => void;
  onOpenReportModal?: () => void;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({
  risk,
  onClearDocument,
  onFlagSecondary,
  onDetainSubject,
  onOpenReportModal,
}) => {
  const { overallRiskScore, riskTier, breakdown, keyRiskFactors, positiveFactors, recommendedAction } = risk;

  // Determine colors based on tier
  const isClear = riskTier === 'CLEAR';
  const isSecondary = riskTier === 'SECONDARY_REVIEW';
  const isDetain = riskTier === 'DETAIN_ALERT';

  const tierBg = isClear 
    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
    : isSecondary 
    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
    : 'bg-red-500/10 border-red-500/30 text-red-400';

  const strokeColor = isClear ? '#10b981' : isSecondary ? '#f59e0b' : '#ef4444';

  // SVG Gauge calculations (radius = 58, perimeter = 2 * PI * 58 = 364.4)
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallRiskScore / 100) * circumference;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            {isClear ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            ) : isSecondary ? (
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            ) : (
              <AlertOctagon className="w-5 h-5 text-red-400 animate-pulse" />
            )}
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              AI Composite Risk Assessment
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
            CONFIDENCE: 98.4%
          </span>
        </div>

        {/* Gauge & Decision Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center mb-5">
          {/* Radial Gauge */}
          <div className="sm:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  stroke="#1e293b"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  stroke={strokeColor}
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                  {overallRiskScore}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  / 100 RISK
                </span>
              </div>
            </div>
          </div>

          {/* Decision Status Box */}
          <div className="sm:col-span-7 flex flex-col gap-2">
            <div className={`p-3 rounded-xl border ${tierBg} flex flex-col gap-1`}>
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">
                Checkpoint Decision Tier:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-wide">
                  {isClear && '🟢 LOW RISK — CLEAR PASSENGER'}
                  {isSecondary && '🟡 MEDIUM RISK — SECONDARY REVIEW'}
                  {isDetain && '🔴 HIGH RISK — DETAIN & ALERT'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              <strong className="text-white">Directive: </strong>
              {recommendedAction}
            </p>
          </div>
        </div>

        {/* Breakdown Progress Bars */}
        <div className="space-y-2.5 bg-slate-950/80 rounded-xl p-3.5 border border-slate-800/80 mb-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Module Risk Vector Breakdown:
          </span>

          {/* OCR Extraction */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-300">OCR Data Integrity</span>
              <span className="text-emerald-400 font-bold">{breakdown.ocrExtractionScore}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${breakdown.ocrExtractionScore}%` }}
              />
            </div>
          </div>

          {/* MRZ Compliance */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-300">ICAO 9303 MRZ Validation</span>
              <span className={`font-bold ${breakdown.mrzValidationScore >= 80 ? 'text-emerald-400' : 'text-red-400'}`}>
                {breakdown.mrzValidationScore}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  breakdown.mrzValidationScore >= 80 ? 'bg-emerald-500' : 'bg-red-500'
                }`}
                style={{ width: `${breakdown.mrzValidationScore}%` }}
              />
            </div>
          </div>

          {/* Tamper Forensics */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-300">Tamper &amp; Splicing Forensics</span>
              <span className={`font-bold ${breakdown.tamperRiskScore > 30 ? 'text-red-400' : 'text-emerald-400'}`}>
                {breakdown.tamperRiskScore}% Risk
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  breakdown.tamperRiskScore > 30 ? 'bg-red-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${breakdown.tamperRiskScore}%` }}
              />
            </div>
          </div>

          {/* Biometrics */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-300">Biometric Facial Match</span>
              <span className={`font-bold ${breakdown.biometricMatchScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {breakdown.biometricMatchScore}% Match
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  breakdown.biometricMatchScore >= 80 ? 'bg-cyan-500' : 'bg-amber-500'
                }`}
                style={{ width: `${breakdown.biometricMatchScore}%` }}
              />
            </div>
          </div>

          {/* Watchlist Threat */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-300">Interpol / SSB Watchlist Hit</span>
              <span className={`font-bold ${breakdown.watchlistThreatScore > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {breakdown.watchlistThreatScore > 0 ? 'ACTIVE MATCH' : 'CLEARED (0%)'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  breakdown.watchlistThreatScore > 0 ? 'bg-red-600' : 'bg-emerald-500'
                }`}
                style={{ width: `${breakdown.watchlistThreatScore || 5}%` }}
              />
            </div>
          </div>
        </div>

        {/* Risk & Positive Factors */}
        {keyRiskFactors.length > 0 && (
          <div className="mb-4 bg-red-950/40 border border-red-900/60 rounded-xl p-3">
            <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              Critical Risk Triggers ({keyRiskFactors.length}):
            </span>
            <ul className="space-y-1 text-xs text-red-200">
              {keyRiskFactors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-red-500 font-bold">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Buttons for Border Security Personnel */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={onClearDocument}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Clear Gate
          </button>
          <button
            onClick={onFlagSecondary}
            className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-950"
          >
            <FileWarning className="w-3.5 h-3.5" />
            Flag Secondary
          </button>
          <button
            onClick={onDetainSubject}
            className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-red-950"
          >
            <Lock className="w-3.5 h-3.5" />
            Detain &amp; Alert
          </button>
        </div>

        <button
          onClick={onOpenReportModal}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 mt-1"
        >
          <FileText className="w-4 h-4 text-cyan-400" />
          Generate Official MHA Forensic Dossier (PDF)
        </button>
      </div>
    </div>
  );
};
