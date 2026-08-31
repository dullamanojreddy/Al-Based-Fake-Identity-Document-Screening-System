import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Database, 
  CheckCircle2, 
  AlertOctagon, 
  RefreshCw, 
  Lock, 
  Layers, 
  AlertTriangle,
  FileCode
} from 'lucide-react';
import { AuditLogBlock } from '../types';
import { getInitialAuditLedger, verifyAuditChain } from '../utils/auditLedger';

export const AuditLedgerView: React.FC = () => {
  const [ledger, setLedger] = useState<AuditLogBlock[]>(() => getInitialAuditLedger());
  const [verificationResult, setVerificationResult] = useState(verifyAuditChain(ledger));
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setVerificationResult(verifyAuditChain(ledger));
      setIsVerifying(false);
    }, 400);
  };

  const handleSimulateTampering = () => {
    // Intentionally mutate block #2 payload to demonstrate cryptographic hash chain break
    const mutated = [...ledger];
    if (mutated.length > 2) {
      mutated[2] = {
        ...mutated[2],
        payload: { ...mutated[2].payload, riskScore: 0, decision: 'CLEARED_UNAUTHORIZED' },
      };
      setLedger(mutated);
      setVerificationResult(verifyAuditChain(mutated));
    }
  };

  const handleRestoreLedger = () => {
    const clean = getInitialAuditLedger();
    setLedger(clean);
    setVerificationResult(verifyAuditChain(clean));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold uppercase tracking-wider text-white">
              Cryptographic SHA-256 Hash-Chained Audit Ledger
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident immutable ledger logging all officer decisions, screening events, and security flags
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            Verify Cryptographic Chain
          </button>

          {verificationResult.isValid ? (
            <button
              onClick={handleSimulateTampering}
              className="px-3.5 py-2 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Simulate Database Tampering
            </button>
          ) : (
            <button
              onClick={handleRestoreLedger}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Restore Clean Ledger
            </button>
          )}
        </div>
      </div>

      {/* Integrity Status Card */}
      <div
        className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
          verificationResult.isValid
            ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200'
            : 'bg-red-950/60 border-red-600 text-red-200 shadow-[0_0_30px_rgba(220,38,38,0.3)] animate-in fade-in'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border ${
              verificationResult.isValid
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-red-500/20 border-red-500/40 text-red-400'
            }`}
          >
            {verificationResult.isValid ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            )}
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest block opacity-80">
              Audit Chain Verification Status:
            </span>
            <h3 className="text-base font-black tracking-wide">
              {verificationResult.isValid
                ? 'AUDIT INTEGRITY: VERIFIED (100% UNBROKEN CHAIN)'
                : 'CRITICAL ALERT: AUDIT CHAIN INCONSISTENCY / TAMPERING DETECTED!'}
            </h3>
            {verificationResult.error && (
              <p className="text-xs text-red-300 font-mono mt-0.5">{verificationResult.error}</p>
            )}
          </div>
        </div>

        <div className="text-right font-mono text-xs hidden sm:block">
          <span className="text-slate-400 block">Total Anchored Blocks</span>
          <span className="text-lg font-bold text-white">{verificationResult.totalBlocks} Blocks</span>
        </div>
      </div>

      {/* Blocks Timeline Stream */}
      <div className="space-y-4">
        {ledger.map((block, idx) => {
          const isBroken = !verificationResult.isValid && verificationResult.brokenBlockIndex === idx;

          return (
            <div
              key={block.id}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-xl transition-all ${
                isBroken
                  ? 'border-red-500 bg-red-950/30 ring-2 ring-red-500/50'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono font-bold text-xs rounded">
                    BLOCK #{block.sequenceNumber}
                  </span>
                  <span className="text-xs font-bold text-white">{block.action}</span>
                  <span className="text-[10px] font-mono text-slate-400">[{block.entityType}]</span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span>Actor: <strong className="text-slate-300">{block.actorId}</strong></span>
                  <span>{new Date(block.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Hashes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950 p-3 rounded-xl border border-slate-800/80 mb-3">
                <div>
                  <span className="text-slate-500 block">Previous Block Hash:</span>
                  <span className="text-slate-400 break-all select-all">{block.previousHash}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Current Record Hash (SHA-256):</span>
                  <span className={`break-all select-all font-bold ${isBroken ? 'text-red-400' : 'text-cyan-300'}`}>
                    {block.recordHash}
                  </span>
                </div>
              </div>

              {/* Event Payload */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/50 text-xs text-slate-300">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Canonical Event Payload:
                </span>
                <pre className="font-mono text-[11px] text-emerald-300 whitespace-pre-wrap">
                  {JSON.stringify(block.payload, null, 2)}
                </pre>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
