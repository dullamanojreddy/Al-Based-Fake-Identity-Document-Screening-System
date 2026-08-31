import React, { useState } from 'react';
import { 
  TrendingUp, 
  Flag, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  ListFilter, 
  Globe, 
  ChevronRight,
  Sparkles,
  Layers,
  Activity
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
  const [throughputTimeRange, setThroughputTimeRange] = useState<'1H' | '24H'>('24H');

  // Dynamic statistics calculated directly from active database sessions
  const totalActive = sessions.length;
  const flaggedCount = sessions.filter((s) => s.risk.overallRiskScore >= 26).length;
  const watchlistHits = sessions.filter((s) => s.watchlist.isHit).length;

  return (
    <div className="space-y-6 pb-8 text-slate-200">
      {/* Top Title & System Time Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#152238] pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Mission Control Overview
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Live forensic screening metrics and global terminal status.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>T-Minus: 00:00:00</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System Online
          </span>
        </div>
      </div>

      {/* 4 Stat Metric Cards (Dynamically Computed from Database) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: ACTIVE SCREENINGS */}
        <div className="bg-[#0b1424] border border-[#182740] rounded-xl p-4 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                ACTIVE SCREENINGS
              </span>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-white tracking-tight">
                {totalActive}
              </span>
              <span className="text-xs font-mono text-slate-400 font-semibold">
                Live Records
              </span>
            </div>
          </div>

          {/* Mini Bar Graph */}
          <div className="flex items-end gap-1.5 h-6 mt-4 pt-2">
            <div className="w-full bg-[#1e2f4a] rounded-xs h-2" />
            <div className="w-full bg-[#1e2f4a] rounded-xs h-3" />
            <div className="w-full bg-[#1e2f4a] rounded-xs h-2.5" />
            <div className="w-full bg-[#38bdf8] rounded-xs h-5" />
            <div className="w-full bg-[#1e2f4a] rounded-xs h-3" />
          </div>
        </div>

        {/* Card 2: FLAGGED DOCUMENTS */}
        <div className="bg-[#0b1424] border border-[#182740] rounded-xl p-4 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-3">
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
                Anomalous
              </span>
            </div>
          </div>

          {/* Mini Bar Graph */}
          <div className="flex items-end gap-1.5 h-6 mt-4 pt-2">
            <div className="w-full bg-[#3d2914] rounded-xs h-2" />
            <div className="w-full bg-[#d97706] rounded-xs h-4" />
            <div className="w-full bg-[#3d2914] rounded-xs h-2.5" />
            <div className="w-full bg-[#f59e0b] rounded-xs h-3.5" />
            <div className="w-full bg-[#f59e0b] rounded-xs h-5" />
          </div>
        </div>

        {/* Card 3: WATCHLIST HITS */}
        <div className="bg-[#0b1424] border border-[#182740] rounded-xl p-4 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#f87171]">
                WATCHLIST HITS
              </span>
              <AlertTriangle className="w-4 h-4 text-[#f87171]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-[#f87171] tracking-tight">
                {watchlistHits}
              </span>
              <span className="text-xs font-mono text-[#fca5a5] font-bold uppercase tracking-wide">
                CRITICAL
              </span>
            </div>
          </div>

          {/* Mini Bar Graph */}
          <div className="flex items-end gap-1.5 h-6 mt-4 pt-2">
            <div className="w-full bg-[#2a1418] rounded-xs h-1.5" />
            <div className="w-full bg-[#2a1418] rounded-xs h-2" />
            <div className="w-full bg-[#f87171] rounded-xs h-4.5" />
            <div className="w-full bg-[#2a1418] rounded-xs h-2" />
            <div className="w-full bg-[#f87171] rounded-xs h-5" />
            <div className="w-full bg-[#2a1418] rounded-xs h-1.5" />
          </div>
        </div>

        {/* Card 4: SYSTEM INTEGRITY */}
        <div className="bg-[#0b1424] border border-[#182740] rounded-xl p-4 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                SYSTEM INTEGRITY
              </span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <span className="text-2xl font-bold font-mono text-white tracking-wide block">
                VERIFIED
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                All nodes operational
              </div>
            </div>
          </div>

          <div className="h-6 mt-4 flex items-center">
            <div className="w-full bg-[#122035] h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-400 h-full w-[99.9%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Live Screening Queue Table (Rendered from DB Sessions) */}
      <div className="bg-[#0b1424] border border-[#182740] rounded-xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-[#182740] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
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
                <th className="py-3 px-5">ID</th>
                <th className="py-3 px-5">Name</th>
                <th className="py-3 px-5">Doc Type</th>
                <th className="py-3 px-5">Source Terminal</th>
                <th className="py-3 px-5">Processing Status</th>
                <th className="py-3 px-5 text-right">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#15233a] font-sans">
              {sessions.map((item) => {
                const isHigh = item.risk.overallRiskScore >= 66;
                const isMedium = item.risk.overallRiskScore >= 26 && item.risk.overallRiskScore < 66;
                const statusLabel = item.status === 'CLEARED' ? 'Complete' : item.status === 'SECONDARY_INSPECTION' ? 'Forensic' : 'Halted';
                const statusProgress = item.status === 'CLEARED' ? 100 : item.status === 'SECONDARY_INSPECTION' ? 65 : 40;
                const statusColor = item.status === 'CLEARED' ? 'bg-white' : item.status === 'SECONDARY_INSPECTION' ? 'bg-[#f59e0b]' : 'bg-[#f87171]';

                const riskTier = isHigh ? 'Enhanced' : isMedium ? 'Review' : 'Clear';
                const riskColor = isHigh
                  ? 'bg-[#3b1219] text-[#fca5a5] border border-[#882233]'
                  : isMedium
                  ? 'bg-[#291e11] text-[#fbbf24] border border-[#784d12]'
                  : 'bg-[#121c2d] text-slate-300 border border-[#22334d]';

                return (
                  <tr 
                    key={item.id}
                    onClick={() => onSelectScreening(item)}
                    className="hover:bg-[#101b2f] transition cursor-pointer"
                  >
                    <td className="py-3 px-5 font-mono text-slate-300 font-semibold">
                      {item.id}
                    </td>
                    <td className={`py-3 px-5 font-medium ${isHigh ? 'text-[#f87171] font-bold' : 'text-slate-200'}`}>
                      {item.travelerName}
                    </td>
                    <td className="py-3 px-5 text-slate-300 uppercase text-[11px]">
                      {item.documentType.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-5 font-mono text-slate-400 text-[11px]">
                      {item.checkpointId}
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3 max-w-[180px]">
                        <div className="w-20 bg-[#15233a] h-1.5 rounded-full overflow-hidden shrink-0">
                          <div
                            className={`h-full rounded-full ${statusColor}`}
                            style={{ width: `${statusProgress}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-slate-300">
                          {statusLabel}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-right">
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase inline-block ${riskColor}`}>
                        {riskTier}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Split: Alert Feed & Global Terminal Throughput */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Alert Feed */}
        <div className="lg:col-span-5 bg-[#0b1424] border border-[#182740] rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#182740] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#f87171]" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Alert Feed
                </h3>
              </div>
              <span className="px-2 py-0.5 bg-[#4c161d] text-[#fca5a5] text-[10px] font-mono font-bold rounded">
                {flaggedCount} Active Flags
              </span>
            </div>

            <div className="space-y-3">
              {sessions.filter(s => s.risk.overallRiskScore >= 26).slice(0, 3).map((alertItem, idx) => (
                <div 
                  key={alertItem.id} 
                  onClick={() => onSelectScreening(alertItem)}
                  className={`bg-[#121c2e] border-l-2 p-3 rounded-r-lg cursor-pointer hover:bg-[#18263e] transition ${
                    alertItem.risk.overallRiskScore >= 66 ? 'border-[#f87171]' : 'border-[#f59e0b]'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 mb-1">
                    <span className={`font-bold ${alertItem.risk.overallRiskScore >= 66 ? 'text-[#f87171]' : 'text-[#f59e0b]'}`}>
                      #{alertItem.id}
                    </span>
                    <span>{new Date(alertItem.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">
                    {alertItem.risk.keyRiskFactors[0] || 'Forensic Discrepancy Detected'}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans line-clamp-2">
                    Subject {alertItem.travelerName} ({alertItem.travelerNationality}) flagged at {alertItem.checkpointId}. {alertItem.risk.recommendedAction}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Global Terminal Throughput Map Visualization */}
        <div className="lg:col-span-7 bg-[#0b1424] border border-[#182740] rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#182740] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Global Terminal Throughput
                </h3>
              </div>

              <div className="flex items-center gap-1 bg-[#08101c] p-0.5 rounded border border-[#1b2b46]">
                <button
                  onClick={() => setThroughputTimeRange('1H')}
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded transition ${
                    throughputTimeRange === '1H' ? 'bg-[#182a47] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  1H
                </button>
                <button
                  onClick={() => setThroughputTimeRange('24H')}
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded transition ${
                    throughputTimeRange === '24H' ? 'bg-[#182a47] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  24H
                </button>
              </div>
            </div>

            {/* Dark Blueprint Grid Map */}
            <div className="relative h-56 w-full bg-[#070e1a] rounded-lg border border-[#142239] overflow-hidden flex items-center justify-center p-4">
              <div 
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: `linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)`,
                  backgroundSize: '24px 24px'
                }}
              />

              {/* Glowing Nodes */}
              <div className="absolute left-[28%] top-[30%] flex flex-col items-center">
                <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#38bdf8] animate-ping opacity-75" />
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 -mt-2.5" />
                <span className="text-[9px] font-mono font-bold text-slate-400 mt-1">JFK</span>
              </div>

              <div className="absolute right-[22%] top-[38%] flex flex-col items-center">
                <span className="w-3.5 h-3.5 rounded-full bg-[#f59e0b] shadow-[0_0_12px_#f59e0b]" />
                <span className="text-[9px] font-mono font-bold text-[#f59e0b] mt-1">LHR</span>
              </div>

              <div className="absolute left-[46%] bottom-[24%] flex flex-col items-center">
                <span className="w-5 h-5 rounded-full bg-[#f87171] opacity-30 animate-pulse" />
                <span className="w-3 h-3 rounded-full bg-[#f87171] shadow-[0_0_15px_#ef4444] -mt-4" />
                <span className="text-[9px] font-mono font-bold text-[#fca5a5] mt-1">CDG</span>
              </div>

              <div className="absolute right-[38%] bottom-[32%] flex flex-col items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-200 opacity-60" />
                <span className="text-[9px] font-mono font-bold text-slate-400 mt-1">DXB</span>
              </div>

              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                <path
                  d="M 160,80 Q 240,140 320,110 T 480,95"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                />
              </svg>

              <span className="text-xs font-mono text-slate-400 tracking-wider z-10 select-none">
                [Global Activity Visualization Area]
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
