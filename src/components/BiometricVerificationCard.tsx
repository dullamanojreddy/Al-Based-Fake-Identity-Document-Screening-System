import React from 'react';
import { 
  ScanFace, 
  Camera, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  AlertTriangle,
  UserX
} from 'lucide-react';
import { BiometricVerification } from '../types';

interface BiometricVerificationCardProps {
  biometrics?: BiometricVerification;
  onOpenLiveCamera?: () => void;
}

export const BiometricVerificationCard: React.FC<BiometricVerificationCardProps> = ({
  biometrics,
  onOpenLiveCamera,
}) => {
  if (!biometrics) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col items-center justify-center text-center">
        <ScanFace className="w-12 h-12 text-slate-600 mb-2" />
        <h4 className="text-sm font-bold text-slate-300">Live Facial Biometric Verification</h4>
        <p className="text-xs text-slate-400 mb-4 max-w-sm">
          Capture traveler's live face at the terminal camera to verify 1:1 identity match against the document portrait.
        </p>
        <button
          onClick={onOpenLiveCamera}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-cyan-950"
        >
          <Camera className="w-4 h-4" />
          Activate Checkpoint Camera
        </button>
      </div>
    );
  }

  const {
    isBiometricVerified,
    similarityScore,
    matchStatus,
    antiSpoofing,
    documentFaceUrl,
    livePassengerFaceUrl,
    details,
  } = biometrics;

  const isVerified = matchStatus === 'MATCH_VERIFIED';
  const isImpersonator = matchStatus === 'SUSPECT_IMPERSONATION';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <ScanFace className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Module 4: 1:1 Facial Biometrics &amp; Anti-Spoofing
          </h3>
        </div>
        <button
          onClick={onOpenLiveCamera}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
        >
          <Camera className="w-3.5 h-3.5 text-cyan-400" />
          Retake Live Face
        </button>
      </div>

      {/* Side-by-Side Face Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center mb-4">
        {/* Document Portrait */}
        <div className="sm:col-span-4 flex flex-col items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Document Portrait
          </span>
          <div className="w-24 h-28 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center relative shadow-inner">
            {documentFaceUrl ? (
              <img src={documentFaceUrl} alt="Document Face" className="w-full h-full object-cover" />
            ) : (
              <div className="w-16 h-20 bg-blue-900/40 rounded flex flex-col items-center justify-center text-[10px] text-blue-300">
                <div className="w-8 h-8 rounded-full bg-blue-500 mb-1" />
                <span>Extracted</span>
              </div>
            )}
            <div className="absolute top-1 left-1 bg-slate-900/80 text-[8px] font-mono px-1 rounded text-cyan-300">
              68 Landmarks
            </div>
          </div>
        </div>

        {/* Biometric Similarity Gauge & Match Indicator */}
        <div className="sm:col-span-4 flex flex-col items-center justify-center text-center">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Biometric Match
          </div>
          <span
            className={`text-3xl font-black font-mono tracking-tight ${
              isVerified ? 'text-emerald-400' : isImpersonator ? 'text-red-400' : 'text-amber-400'
            }`}
          >
            {similarityScore}%
          </span>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-2 mb-2 overflow-hidden max-w-[140px]">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isVerified ? 'bg-emerald-500' : isImpersonator ? 'bg-red-500' : 'bg-amber-500'
              }`}
              style={{ width: `${similarityScore}%` }}
            />
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
              isVerified
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-red-950 text-red-400 border border-red-800'
            }`}
          >
            {isVerified ? 'MATCH VERIFIED' : 'SUSPECT IMPERSONATION'}
          </span>
        </div>

        {/* Live Passenger Camera Capture */}
        <div className="sm:col-span-4 flex flex-col items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Live Checkpoint Face
          </span>
          <div className="w-24 h-28 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center relative shadow-inner">
            {livePassengerFaceUrl ? (
              <img src={livePassengerFaceUrl} alt="Live Passenger" className="w-full h-full object-cover" />
            ) : (
              <div className="w-16 h-20 bg-emerald-900/40 rounded flex flex-col items-center justify-center text-[10px] text-emerald-300">
                <div className="w-8 h-8 rounded-full bg-emerald-500 mb-1" />
                <span>Live Cam</span>
              </div>
            )}
            <div className="absolute top-1 right-1 bg-emerald-950/90 text-[8px] font-mono px-1 rounded text-emerald-400 border border-emerald-800">
              LIVE
            </div>
          </div>
        </div>
      </div>

      {/* Anti-Spoofing & Liveness Checks */}
      <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 mb-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Anti-Spoofing &amp; Presentation Attack Diagnostics:
        </span>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">3D Liveness</span>
            <span className="font-bold text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
            </span>
          </div>

          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Screen Replay</span>
            <span className={`font-bold flex items-center justify-center gap-1 mt-0.5 ${antiSpoofing.screenReplayAttack ? 'text-red-400' : 'text-emerald-400'}`}>
              {antiSpoofing.screenReplayAttack ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              {antiSpoofing.screenReplayAttack ? 'ATTACK DETECTED' : 'NONE'}
            </span>
          </div>

          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Printed Photo Attack</span>
            <span className={`font-bold flex items-center justify-center gap-1 mt-0.5 ${antiSpoofing.printAttackDetected ? 'text-red-400' : 'text-emerald-400'}`}>
              {antiSpoofing.printAttackDetected ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              {antiSpoofing.printAttackDetected ? 'PRINT DETECTED' : 'NONE'}
            </span>
          </div>
        </div>
      </div>

      {/* Details banner */}
      <div className={`p-3 rounded-xl border text-xs leading-relaxed ${isVerified ? 'bg-emerald-950/30 border-emerald-900/60 text-emerald-200' : 'bg-red-950/40 border-red-900/80 text-red-200'}`}>
        <p>{details}</p>
      </div>
    </div>
  );
};
