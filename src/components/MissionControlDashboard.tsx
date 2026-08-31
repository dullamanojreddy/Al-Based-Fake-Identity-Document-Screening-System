import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Flag, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  ListFilter, 
  ChevronRight,
  Sparkles,
  Layers,
  Activity,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Shield,
  FileText
} from 'lucide-react';
import { ScreeningSession } from '../types';

interface MissionControlDashboardProps {
  sessions: ScreeningSession[];
  onSelectScreening: (session: ScreeningSession) => void;
  onNavigateToScreenings: () => void;
  onNewScreening: () => void;
}

export const MissionControlDashboard: React.FC<MissionControlDashboardProps> = ({
  sessions = [],
  onSelectScreening,
  onNavigateToScreenings,
  onNewScreening,
}) => {
  // Live Clock formatting (e.g. 31 AUG 2026 23:12 IST)
  const [currentDateTime, setCurrentDateTime] = useState<string>(() => {
    const d = new Date();
    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${year} ${hours}:${mins} IST`;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      const day = d.getDate().toString().padStart(2, '0');
      const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const year = d.getFullYear();
      const hours = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      setCurrentDateTime(`${day} ${month} ${year} ${hours}:${mins} IST`);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // 100% Dynamic statistics calculated directly from active database sessions
  const totalActive = sessions.length;
  const flaggedCount = sessions.filter(
    (s) => (s.risk?.overallRiskScore ?? 0) >= 26 && s.status !== 'UNSUPPORTED_DOCUMENT'
  ).length;
  const criticalFindingsCount = sessions.filter(
    (s) => (s.risk?.overallRiskScore ?? 0) >= 60 || s.risk?.findings?.some((f) => f.severity === 'CRITICAL' || f.severity === 'HIGH')
  ).length;

  // Extract top recent findings across all sessions
  const allRecentFindings = sessions.flatMap((s) =>
    (s.risk?.findings || []).map((f) => ({
      ...f,
      sessionRef: s.id,
      traveler: s.travelerName,
      checkpoint: s.checkpointId,
    }))
  ).slice(0, 4);

  return (
    <div className="space-y-6 pb-8 text-slate-200 font-sans">
      {/* Top Title & Live IST Time Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#152238] pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Screening Operations
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time document screening, anomaly detection and verification activity.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300 font-semibold">{currentDateTime}</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            SYSTEM OPERATIONAL
          </span>
        </div>
      </div>

      {/* 4 Standardized KPI Cards (Dynamically Computed from Database) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: ACTIVE SCREENINGS (Cyan) */}
        <div className="bg-[#0b1424] border border-[#182740] rounded-xl p-4 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                ACTIVE SCREENINGS
              </span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-white tracking-tight">
                {totalActive}
              </span>
              <span className="text-xs font-mono text-slate-400 font-semibold">
                Currently processing
              </span>
            </div>
          </div>

          <div className="flex items-end gap-1.5 h-4 mt-3 pt-1">
            <div className="w-full bg-[#1e2f4a] rounded-xs h-1.5" />
            <div className="w-full bg-[#1e2f4a] rounded-xs h-2.5" />
            <div className="w-full bg-[#1e2f4a] rounded-xs h-2" />
            <div className="w-full bg-cyan-400 rounded-xs h-4" />
            <div className="w-full bg-[#1e2f4a] rounded-xs h-2.5" />
          </div>
        </div>

        {/* Card 2: FLAGGED DOCUMENTS (Amber) */}
        <div className="bg-[#0b1424] border border-[#182740] rounded-xl p-4 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#f59e0b]">
                FLAGGED DOCUMENTS
              </span>
              <Flag className="w-4 h-4 text-[#f59e0b]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-[#f59e0b] tracking-tight">
                {flaggedCount}
              </span>
              <span className="text-xs font-mono text-slate-400 font-semibold">
                Requires review
              </span>
            </div>
          </div>

          <div className="flex items-end gap-1.5 h-4 mt-3 pt-1">
            <div className="w-full bg-[#3d2914] rounded-xs h-1.5" />
            <div className="w-full bg-[#d97706] rounded-xs h-3" />
            <div className="w-full bg-[#3d2914] rounded-xs h-2" />
            <div className="w-full bg-[#f59e0b] rounded-xs h-4" />
            <div className="w-full bg-[#f59e0b] rounded-xs h-3.5" />
          </div>
        </div>

        {/* Card 3: CRITICAL FINDINGS (Red) */}
        <div className="bg-[#0b1424] border border-[#182740] rounded-xl p-4 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#f87171]">
                CRITICAL FINDINGS
              </span>
              <AlertTriangle className="w-4 h-4 text-[#f87171]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-[#f87171] tracking-tight">
                {criticalFindingsCount}
              </span>
              <span className="text-xs font-mono text-[#fca5a5] font-semibold">
                High-priority anomalies
              </span>
            </div>
          </div>

          <div className="flex items-end gap-1.5 h-4 mt-3 pt-1">
            <div className="w-full bg-[#2a1418] rounded-xs h-1.5" />
            <div className="w-full bg-[#2a1418] rounded-xs h-2" />
            <div className="w-full bg-[#f87171] rounded-xs h-4" />
            <div className="w-full bg-[#2a1418] rounded-xs h-2" />
            <div className="w-full bg-[#f87171] rounded-xs h-4" />
          </div>
        </div>

        {/* Card 4: SYSTEM STATUS (Green) */}
        <div className="bg-[#0b1424] border border-[#182740] rounded-xl p-4 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                SYSTEM STATUS
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-2xl font-bold font-mono text-white tracking-wide block">
                OPERATIONAL
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#4ade80]" />
                6/6 services online
              </div>
            </div>
          </div>

          <div className="h-4 mt-3 flex items-center">
            <div className="w-full bg-[#122035] h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full w-[100%]" />
            </div>
          </div>
        </div>
      </div>

      {/* LIVE SCREENING QUEUE (Rendered Dynamically from Sessions) */}
      <div className="bg-[#0b1424] border border-[#182740] rounded-xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-[#182740] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-wide font-mono uppercase">
              Live Screening Queue ({sessions.length})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNewScreening}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-mono font-bold uppercase tracking-wider rounded transition"
            >
              + NEW CASE
            </button>
            <button
              onClick={onNavigateToScreenings}
              className="px-3 py-1 bg-[#121f35] hover:bg-[#182a47] text-slate-300 hover:text-white border border-[#223553] text-[10px] font-mono font-bold uppercase tracking-wider rounded transition"
            >
              VIEW ALL
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#070e1a] text-slate-400 font-mono text-[10px] uppercase border-b border-[#182740]">
              <tr>
                <th className="py-3 px-5">SCREENING ID</th>
                <th className="py-3 px-5">IDENTITY</th>
                <th className="py-3 px-5">DOCUMENT</th>
                <th className="py-3 px-5">SOURCE</th>
                <th className="py-3 px-5">STATUS</th>
                <th className="py-3 px-5 text-right">RISK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#15233a] font-sans">
              {sessions.map((item) => {
                const isUnsupported = item.status === 'UNSUPPORTED_DOCUMENT' || item.documentType === 'unsupported_document';
                const riskScore = item.risk?.overallRiskScore ?? 0;
                const isEnhanced = riskScore >= 60 || item.risk?.reviewPriority === 'ENHANCED REVIEW RECOMMENDED';
                const isHigh = riskScore >= 40 && riskScore < 60;
                const isReview = riskScore >= 20 && riskScore < 40;
                
                // Pipeline Stage and Progress
                let statusLabel = 'COMPLETE';
                let statusProgress = 100;
                let statusColor = 'bg-emerald-400';

                if (isUnsupported) {
                  statusLabel = 'NOT SCREENED';
                  statusProgress = 0;
                  statusColor = 'bg-slate-600';
                } else if (item.status === 'DETAINED') {
                  statusLabel = 'HALTED / DETAINED';
                  statusProgress = 40;
                  statusColor = 'bg-[#f87171]';
                } else if (item.status === 'SECONDARY_INSPECTION') {
                  statusLabel = 'FORENSICS / REVIEW';
                  statusProgress = 75;
                  statusColor = 'bg-[#f59e0b]';
                }

                return (
                  <tr 
                    key={item.id}
                    onClick={() => onSelectScreening(item)}
                    className="hover:bg-[#101b2f] transition cursor-pointer"
                  >
                    <td className="py-3 px-5 font-mono text-cyan-300 font-semibold">
                      {item.id}
                    </td>
                    <td className={`py-3 px-5 font-medium ${isEnhanced ? 'text-[#f87171] font-bold' : 'text-slate-200'}`}>
                      {item.travelerName}
                    </td>
                    <td className="py-3 px-5 text-slate-300 uppercase text-[11px] font-mono">
                      {isUnsupported ? 'UNSUPPORTED / UNKNOWN' : item.documentType.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-5 font-mono text-slate-400 text-[11px]">
                      {item.checkpointId}
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3 max-w-[180px]">
                        <div className="w-16 bg-[#15233a] h-1.5 rounded-full overflow-hidden shrink-0">
                          <div
                            className={`h-full rounded-full ${statusColor}`}
                            style={{ width: `${statusProgress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-300">
                          {statusLabel}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-right">
                      {isUnsupported ? (
                        <span className="text-slate-500 font-mono text-xs">—</span>
                      ) : isEnhanced ? (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#3b1219] text-[#fca5a5] border border-[#882233]">
                          🔴 ENHANCED
                        </span>
                      ) : isHigh ? (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#361a10] text-[#fb923c] border border-[#7c2d12]">
                          🟠 HIGH
                        </span>
                      ) : isReview ? (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#291e11] text-[#fbbf24] border border-[#784d12]">
                          🟡 REVIEW
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#0e1e17] text-[#4ade80] border border-[#1d5236]">
                          🟢 CLEAR
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two-Column Lower Zone: Recent Findings Feed & Subsystem Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: RECENT FINDINGS (Cols 7) */}
        <div className="lg:col-span-7 bg-[#0b1424] border border-[#182740] rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#182740] pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                RECENT ANOMALY FINDINGS
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {allRecentFindings.length} Active Records
            </span>
          </div>

          <div className="space-y-2.5">
            {allRecentFindings.length === 0 ? (
              <div className="text-xs text-slate-500 font-mono text-center py-6">
                Zero active anomaly findings across live queue.
              </div>
            ) : (
              allRecentFindings.map((finding, idx) => {
                const isCritical = finding.severity === 'CRITICAL' || finding.severity === 'HIGH';

                return (
                  <div
                    key={idx}
                    className="p-3 bg-[#070e1a] border border-[#182740] rounded-lg flex items-center justify-between hover:bg-[#101c30] transition cursor-pointer"
                    onClick={onNavigateToScreenings}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md ${
                        isCritical ? 'bg-[#3b1219] text-[#f87171]' : 'bg-[#291e11] text-[#fbbf24]'
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-white">{finding.title}</h5>
                          <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded">
                            {finding.sessionRef}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {finding.description}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded shrink-0 ${
                      isCritical
                        ? 'bg-[#3b1219] text-[#fca5a5] border border-[#882233]'
                        : 'bg-[#291e11] text-[#fbbf24] border border-[#784d12]'
                    }`}>
                      {finding.severity}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: SYSTEM HEALTH CHECKLIST (Cols 5) */}
        <div className="lg:col-span-5 bg-[#0b1424] border border-[#182740] rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#182740] pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                SYSTEM HEALTH STATUS
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
              OPERATIONAL
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between bg-[#070e1a] p-2.5 rounded-lg border border-[#15233a]">
              <span className="text-slate-300">OCR Multimodal Engine</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Operational
              </span>
            </div>

            <div className="flex items-center justify-between bg-[#070e1a] p-2.5 rounded-lg border border-[#15233a]">
              <span className="text-slate-300">Document Classifier Gate</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Operational
              </span>
            </div>

            <div className="flex items-center justify-between bg-[#070e1a] p-2.5 rounded-lg border border-[#15233a]">
              <span className="text-slate-300">ICAO MRZ 7-3-1 Engine</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Operational
              </span>
            </div>

            <div className="flex items-center justify-between bg-[#070e1a] p-2.5 rounded-lg border border-[#15233a]">
              <span className="text-slate-300">Forensic Compression Analyzer</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Operational
              </span>
            </div>

            <div className="flex items-center justify-between bg-[#070e1a] p-2.5 rounded-lg border border-[#15233a]">
              <span className="text-slate-300">Biometric Nodal Verifier</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Operational
              </span>
            </div>

            <div className="flex items-center justify-between bg-[#070e1a] p-2.5 rounded-lg border border-[#15233a]">
              <span className="text-slate-300">Cryptographic Audit Ledger</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized
              </span>
            </div>

            <div className="flex items-center justify-between bg-[#070e1a] p-2.5 rounded-lg border border-[#15233a]">
              <span className="text-slate-400">Authorized Government API</span>
              <span className="text-slate-500 font-semibold flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-slate-500" /> Not Connected (Standby)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
