import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  AlertOctagon, 
  FileCode,
  Layers
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
    }, 350);
  };

  const handleSimulateTampering = () => {
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
    <div className="space-y-6 pb-12 text-slate-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#152238] pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Cryptographic Audit Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tamper-evident SHA-256 hash-chained event logs for verifiable border intelligence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="px-3.5 py-2 bg-[#d4e4f7] hover:bg-white text-[#071326] rounded-md text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 shadow"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            VERIFY CRYPTOGRAPHIC CHAIN
          </button>

          {verificationResult.isValid ? (
            <button
              onClick={handleSimulateTampering}
              className="px-3.5 py-2 bg-[#3b1219] hover:bg-[#521922] text-[#fca5a5] border border-[#882233] rounded-md text-xs font-mono font-bold uppercase transition flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              SIMULATE TAMPERING
            </button>
          ) : (
            <button
              onClick={handleRestoreLedger}
              className="px-3.5 py-2 bg-[#112419] hover:bg-[#193a26] text-[#6ee7b7] border border-[#1d5236] rounded-md text-xs font-mono font-bold uppercase transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              RESTORE CLEAN LEDGER
            </button>
          )}
        </div>
      </div>

      {/* Cryptographic Integrity Status Card */}
      <div
        className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
          verificationResult.isValid
            ? 'bg-[#09181c] border-[#06b6d4]/60 text-cyan-200'
            : 'bg-[#290d12] border-[#ef4444] text-red-200 shadow-[0_0_30px_rgba(239,68,68,0.25)]'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`p-2.5 rounded-lg border ${
              verificationResult.isValid
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
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
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest block opacity-75">
              Blockchain Ledger Integrity:
            </span>
            <h3 className="text-base font-black tracking-wide font-mono">
              {verificationResult.isValid
                ? 'AUDIT INTEGRITY: VERIFIED (100% UNBROKEN CHAIN)'
                : 'CRITICAL ALERT: CRYPTOGRAPHIC HASH CHAIN BROKEN / TAMPERING DETECTED!'}
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
              className={`bg-[#0b1424] border rounded-xl p-5 shadow-xl transition-all ${
                isBroken
                  ? 'border-[#ef4444] bg-[#290d12]/60 ring-2 ring-red-500/50'
                  : 'border-[#182740]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#182740] pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#121f35] text-cyan-300 border border-[#223553] font-mono font-bold text-xs rounded">
                    BLOCK #{block.sequenceNumber}
                  </span>
                  <span className="text-xs font-bold text-white font-mono">{block.action}</span>
                  <span className="text-[10px] font-mono text-slate-400">[{block.entityType}]</span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span>Actor: <strong className="text-slate-300">{block.actorId}</strong></span>
                  <span>{new Date(block.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Hash Strings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono bg-[#070e1a] p-3 rounded-lg border border-[#15233a] mb-3">
                <div>
                  <span className="text-slate-500 block">Previous Block Hash:</span>
                  <span className="text-slate-400 break-all select-all">{block.previousHash}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Current Block Hash (SHA-256):</span>
                  <span className={`break-all select-all font-bold ${isBroken ? 'text-red-400' : 'text-cyan-300'}`}>
                    {block.recordHash}
                  </span>
                </div>
              </div>

              {/* Payload */}
              <div className="bg-[#070e1a]/80 p-3 rounded-lg border border-[#15233a] text-xs">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
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
