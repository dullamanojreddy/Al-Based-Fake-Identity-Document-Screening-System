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
  onSelectScreening: (session: ScreeningSession) => void;
  onNavigateToScreenings: () => void;
}

export const MissionControlDashboard: React.FC<MissionControlDashboardProps> = ({
  onSelectScreening,
  onNavigateToScreenings,
}) => {
  const [throughputTimeRange, setThroughputTimeRange] = useState<'1H' | '24H'>('24H');

  const QUEUE_ITEMS = [
    {
      id: 'TX-9921',
      caseRef: 'SID-2026-9921',
      name: 'Doe, John A.',
      docType: 'Passport',
      terminal: 'TERM-04-JFK',
      statusLabel: 'Complete',
      statusProgress: 100,
      statusColor: 'bg-white',
      riskTier: 'Clear',
      riskColor: 'bg-[#121c2d] text-slate-300 border border-[#22334d]',
    },
    {
      id: 'TX-9922',
      caseRef: 'SID-2026-9922',
      name: 'Smith, Maria K.',
      docType: 'Visa',
      terminal: 'TERM-12-LHR',
      statusLabel: 'Forensic',
      statusProgress: 65,
      statusColor: 'bg-[#f59e0b]',
      riskTier: 'Review',
      riskColor: 'bg-[#291e11] text-[#fbbf24] border border-[#784d12]',
    },
    {
      id: 'TX-9923',
      caseRef: 'SID-2026-9932',
      name: 'Unknown',
      isUnknown: true,
      docType: 'ID Card',
      terminal: 'TERM-01-CDG',
      statusLabel: 'Halted',
      statusProgress: 40,
      statusColor: 'bg-[#f87171]',
      riskTier: 'Enhanced',
      riskColor: 'bg-[#3b1219] text-[#fca5a5] border border-[#882233] shadow-[0_0_10px_rgba(248,113,113,0.2)]',
    },
    {
      id: 'TX-9924',
      caseRef: 'SID-2026-9924',
      name: 'Chen, Wei',
      docType: 'Passport',
      terminal: 'TERM-08-NRT',
      statusLabel: 'OCR',
      statusProgress: 20,
      statusColor: 'bg-slate-500',
      riskTier: 'Pending',
      riskColor: 'bg-[#111927] text-slate-400 border border-[#1e2a3c]',
    },
  ];

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

      {/* 4 Stat Metric Cards */}
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
                1,248
              </span>
              <span className="text-xs font-mono text-slate-400 font-semibold">
                +12% /hr
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
                42
              </span>
              <span className="text-xs font-mono text-slate-400 font-semibold">
                Today
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
                12
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

      {/* Live Screening Queue Table */}
      <div className="bg-[#0b1424] border border-[#182740] rounded-xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-[#182740] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Live Screening Queue
            </h3>
          </div>

          <button
            onClick={onNavigateToScreenings}
            className="px-3 py-1 bg-[#121f35] hover:bg-[#182a47] text-slate-300 hover:text-white border border-[#223553] text-[10px] font-mono font-bold uppercase tracking-wider rounded transition"
          >
            VIEW ALL
          </button>
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
              {QUEUE_ITEMS.map((item) => (
                <tr 
                  key={item.id}
                  onClick={onNavigateToScreenings}
                  className="hover:bg-[#101b2f] transition cursor-pointer"
                >
                  <td className="py-3 px-5 font-mono text-slate-300 font-semibold">
                    {item.id}
                  </td>
                  <td className={`py-3 px-5 font-medium ${item.isUnknown ? 'text-[#f87171] font-bold' : 'text-slate-200'}`}>
                    {item.name}
                  </td>
                  <td className="py-3 px-5 text-slate-300">
                    {item.docType}
                  </td>
                  <td className="py-3 px-5 font-mono text-slate-400 text-[11px]">
                    {item.terminal}
                  </td>
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3 max-w-[180px]">
                      <div className="w-20 bg-[#15233a] h-1.5 rounded-full overflow-hidden shrink-0">
                        <div
                          className={`h-full rounded-full ${item.statusColor}`}
                          style={{ width: `${item.statusProgress}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate-300">
                        {item.statusLabel}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-5 text-right">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase inline-block ${item.riskColor}`}>
                      {item.riskTier}
                    </span>
                  </td>
                </tr>
              ))}
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
                3 New
              </span>
            </div>

            <div className="space-y-3">
              {/* Alert 1 */}
              <div className="bg-[#121c2e] border-l-2 border-[#f87171] p-3 rounded-r-lg">
                <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 mb-1">
                  <span className="font-bold text-[#f87171]">#AL-402</span>
                  <span>14:02:11</span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1">
                  Biometric Mismatch
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Facial recognition score below threshold (42%) for TX-9923 at TERM-01-CDG....
                </p>
              </div>

              {/* Alert 2 */}
              <div className="bg-[#121c2e] border-l-2 border-[#f59e0b] p-3 rounded-r-lg">
                <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 mb-1">
                  <span className="font-bold text-[#f59e0b]">#AL-401</span>
                  <span>13:45:00</span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1">
                  UV Watermark Anomaly
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Suspicious fluorescence pattern detected on Visa document TX-9922. Secondary scan...
                </p>
              </div>

              {/* Alert 3 */}
              <div className="bg-[#121c2e] border-l-2 border-slate-600 p-3 rounded-r-lg">
                <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 mb-1">
                  <span className="font-bold text-slate-400">#AL-400</span>
                  <span>13:10:55</span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1">
                  Terminal Latency Warning
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  TERM-08-NRT experiencing OCR processing delays &gt; 5 seconds. Routing traffic to fallback...
                </p>
              </div>
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
              {/* Background Grid Lines */}
              <div 
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: `linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)`,
                  backgroundSize: '24px 24px'
                }}
              />

              {/* Glowing Nodes & Vectors */}
              {/* JFK Node */}
              <div className="absolute left-[28%] top-[30%] flex flex-col items-center">
                <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#38bdf8] animate-ping opacity-75" />
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 -mt-2.5" />
                <span className="text-[9px] font-mono font-bold text-slate-400 mt-1">JFK</span>
              </div>

              {/* LHR Node */}
              <div className="absolute right-[22%] top-[38%] flex flex-col items-center">
                <span className="w-3.5 h-3.5 rounded-full bg-[#f59e0b] shadow-[0_0_12px_#f59e0b]" />
                <span className="text-[9px] font-mono font-bold text-[#f59e0b] mt-1">LHR</span>
              </div>

              {/* CDG Active Alert Node */}
              <div className="absolute left-[46%] bottom-[24%] flex flex-col items-center">
                <span className="w-5 h-5 rounded-full bg-[#f87171] opacity-30 animate-pulse" />
                <span className="w-3 h-3 rounded-full bg-[#f87171] shadow-[0_0_15px_#ef4444] -mt-4" />
                <span className="text-[9px] font-mono font-bold text-[#fca5a5] mt-1">CDG</span>
              </div>

              {/* DXB Node */}
              <div className="absolute right-[38%] bottom-[32%] flex flex-col items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-200 opacity-60" />
                <span className="text-[9px] font-mono font-bold text-slate-400 mt-1">DXB</span>
              </div>

              {/* Connecting Wave Line */}
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
