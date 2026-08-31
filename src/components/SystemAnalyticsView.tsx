import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { 
  Download, 
  TrendingUp, 
  AlertTriangle, 
  ShieldAlert, 
  FileText, 
  Search, 
  Eye, 
  Activity, 
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { ScreeningSession } from '../types';

interface SystemAnalyticsViewProps {
  sessions: ScreeningSession[];
  onSelectSession: (session: ScreeningSession) => void;
}

const THROUGHPUT_DATA = [
  { time: '06:00', total: 142, cleared: 138, flagged: 4 },
  { time: '08:00', total: 289, cleared: 275, flagged: 14 },
  { time: '10:00', total: 412, cleared: 390, flagged: 22 },
  { time: '12:00', total: 530, cleared: 504, flagged: 26 },
  { time: '14:00', total: 478, cleared: 450, flagged: 28 },
  { time: '16:00', total: 610, cleared: 575, flagged: 35 },
  { time: '18:00', total: 520, cleared: 492, flagged: 28 },
  { time: '20:00', total: 340, cleared: 326, flagged: 14 },
];

const FORGERY_TECHNIQUES = [
  { name: 'Photo Splicing / Replacement', count: 48, fill: '#8b5cf6' },
  { name: 'MRZ Checksum / DOB Mismatch', count: 36, fill: '#f59e0b' },
  { name: 'Cloned / Forged Consular Stamp', count: 28, fill: '#ec4899' },
  { name: 'Facial Biometric Impersonation', count: 22, fill: '#ef4444' },
  { name: 'Interpol Red Notice / SLTD', count: 12, fill: '#dc2626' },
];

export const SystemAnalyticsView: React.FC<SystemAnalyticsViewProps> = ({
  sessions = [],
  onSelectSession,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const exportCSV = () => {
    const headers = ['Case ID,Timestamp,Traveler Name,Nationality,Passport No,Doc Type,Risk Score,Status'];
    const rows = sessions.map(
      (r) =>
        `"${r.id}","${r.timestamp}","${r.travelerName}","${r.travelerNationality}","${r.travelerPassportNumber}","${r.documentType}","${r.risk?.overallRiskScore ?? 'N/A'}","${r.status}"`
    );
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SENTINEL_ID_Analytics_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const filteredSessions = sessions.filter((s) =>
    s.travelerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.travelerPassportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 text-slate-200">
      {/* Top Header matching Stitch Screenshot 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#152238] pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            System Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational metric overview for current cycle.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-[#d4e4f7] hover:bg-white text-[#071326] font-bold text-xs uppercase tracking-wider rounded-md transition flex items-center gap-2 shadow-[0_0_15px_rgba(212,228,247,0.15)]"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          GENERATE SUMMARY REPORT
        </button>
      </div>

      {/* 3 Metric Cards matching Screenshot 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: TOTAL SCREENINGS */}
        <div className="bg-[#0b1424] border border-[#182740] rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                TOTAL SCREENINGS
              </span>
              <Activity className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-4xl font-bold font-mono text-white tracking-tight block">
              14,208
            </span>
          </div>
          <span className="text-xs font-mono text-cyan-400 font-semibold mt-4 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +12.4% vs last week
          </span>
        </div>

        {/* Card 2: DETECTED ANOMALIES */}
        <div className="bg-[#0b1424] border border-[#182740] rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#f59e0b]">
                DETECTED ANOMALIES
              </span>
              <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
            </div>
            <span className="text-4xl font-bold font-mono text-[#f59e0b] tracking-tight block">
              342
            </span>
          </div>
          <span className="text-xs font-mono text-[#f59e0b] font-semibold mt-4">
            → 2.4% anomaly rate
          </span>
        </div>

        {/* Card 3: WATCHLIST HITS */}
        <div className="bg-[#0b1424] border border-[#182740] rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#f87171]">
                WATCHLIST HITS
              </span>
              <ShieldAlert className="w-4 h-4 text-[#f87171]" />
            </div>
            <span className="text-4xl font-bold font-mono text-[#f87171] tracking-tight block">
              17
            </span>
          </div>
          <span className="text-xs font-mono text-[#fca5a5] font-bold mt-4">
            ! Immediate review required
          </span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Throughput Area Chart */}
        <div className="lg:col-span-7 bg-[#0b1424] border border-[#182740] rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#182740] pb-3 mb-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Screening Volume (Hourly)
            </h3>
            <span className="text-xs font-mono text-slate-400">ICP-RAXAUL-04</span>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={THROUGHPUT_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#182740" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070e1a', borderColor: '#1e304f', borderRadius: '0.5rem', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="total" stroke="#38bdf8" strokeWidth={2} fill="url(#analyticsGrad)" name="Total Screened" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Forgery Distribution */}
        <div className="lg:col-span-5 bg-[#0b1424] border border-[#182740] rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div className="border-b border-[#182740] pb-3 mb-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Forgery Vectors Breakdown
            </h3>
          </div>

          <div className="space-y-3">
            {FORGERY_TECHNIQUES.map((tech) => (
              <div key={tech.name} className="space-y-1">
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-slate-300">{tech.name}</span>
                  <span className="font-mono font-bold text-white">{tech.count}</span>
                </div>
                <div className="w-full h-1.5 bg-[#15233a] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(tech.count / 48) * 100}%`, backgroundColor: tech.fill }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#182740] text-[10px] font-mono text-slate-400 flex justify-between">
            <span>Primary Anomaly: Photo Splicing</span>
            <span className="text-cyan-400 font-bold">146 Flags</span>
          </div>
        </div>
      </div>

      {/* Searchable Case Log Table */}
      <div className="bg-[#0b1424] border border-[#182740] rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#182740] pb-3.5 mb-3.5">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Case Audit Archive
          </h3>

          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, ID, passport..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#070e1a] border border-[#182740] rounded-md pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#070e1a] text-slate-400 font-mono text-[9px] uppercase border-b border-[#182740]">
              <tr>
                <th className="py-2.5 px-3">CASE ID</th>
                <th className="py-2.5 px-3">TRAVELER NAME</th>
                <th className="py-2.5 px-3">DOCUMENT NO</th>
                <th className="py-2.5 px-3">NATIONALITY</th>
                <th className="py-2.5 px-3 text-center">RISK</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#15233a] font-sans">
              {filteredSessions.map((rec) => (
                <tr key={rec.id} className="hover:bg-[#101b2f] transition">
                  <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">{rec.id}</td>
                  <td className="py-2.5 px-3 font-medium text-white">{rec.travelerName}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">{rec.travelerPassportNumber}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{rec.travelerNationality}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      (rec.risk?.overallRiskScore ?? 0) > 65 ? 'bg-red-950 text-red-400' : 'bg-emerald-950 text-emerald-400'
                    }`}>
                      {rec.risk ? `${rec.risk.overallRiskScore}%` : '—'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono uppercase text-[10px] text-slate-300">
                    {rec.status}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onSelectSession(rec)}
                      className="px-2.5 py-1 bg-cyan-950 text-cyan-300 hover:bg-cyan-900 border border-cyan-800 rounded text-[11px] font-bold transition inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
