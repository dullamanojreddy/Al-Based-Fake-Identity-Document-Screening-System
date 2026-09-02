import React, { useState } from 'react';
import { CheckCircle2, FileText, Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import { AuditLogBlock } from '../types';
import { verifyAuditChain } from '../utils/auditLedger';

interface AuditLedgerViewProps { ledger: AuditLogBlock[]; }

export const AuditLedgerView: React.FC<AuditLedgerViewProps> = ({ ledger }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [verification, setVerification] = useState<ReturnType<typeof verifyAuditChain> | null>(null);
  const filteredLedger = ledger.filter((block) =>
    `${block.id} ${block.action} ${block.entityId} ${block.actorId} ${JSON.stringify(block.payload)}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return <div className="space-y-6 pb-12 text-slate-800">
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 pb-5">
      <div><h2 className="text-3xl font-bold text-slate-900 tracking-tight">Cryptographic Audit Chain</h2><p className="text-xs text-slate-500 mt-1">Tamper-evident SHA-256 hash-chain audit ledger for screening and officer actions.</p></div>
      <button onClick={() => setVerification(verifyAuditChain(ledger))} className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-slate-900 font-bold text-xs uppercase rounded-md flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Verify Chain Integrity</button>
    </div>
    {verification && <div role="status" className={`rounded-lg border px-4 py-3 text-xs font-medium flex items-center gap-2 ${verification.isValid ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
      {verification.isValid ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}{verification.isValid ? `Chain verified: ${verification.totalBlocks} blocks are intact.` : verification.error}
    </div>}
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-200"><label className="relative block max-w-sm"><Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search event, screening ID, officer..." className="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-3 py-2 text-xs" /></label></div>
      <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-slate-500 text-[10px] uppercase border-b border-slate-200"><tr><th className="p-3">#</th><th className="p-3">Timestamp (UTC)</th><th className="p-3">Action / Entity</th><th className="p-3">Officer</th><th className="p-3">Details</th><th className="p-3">SHA-256 Hash</th></tr></thead><tbody className="divide-y divide-slate-100">
        {filteredLedger.map((block) => <tr key={block.id} className="hover:bg-slate-50"><td className="p-3 font-mono text-slate-500">{block.sequenceNumber}</td><td className="p-3 font-mono text-slate-600 whitespace-nowrap">{block.timestamp}</td><td className="p-3"><div className="font-bold text-slate-900 flex gap-1.5 items-center"><FileText className="w-3.5 h-3.5 text-blue-600" />{block.action}</div><div className="font-mono text-[10px] text-slate-500">{block.entityId}</div></td><td className="p-3 font-mono text-slate-700">{block.actorId}</td><td className="p-3 max-w-xs truncate text-slate-600" title={JSON.stringify(block.payload)}>{JSON.stringify(block.payload)}</td><td className="p-3 font-mono text-[10px] text-slate-500 select-all">{block.recordHash}</td></tr>)}
      </tbody></table></div>
    </div>
  </div>;
};
