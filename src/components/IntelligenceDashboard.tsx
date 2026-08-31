import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  AlertOctagon, 
  Clock, 
  Download, 
  Search, 
  Filter, 
  Eye, 
  FileText,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { ScreeningSession, ScreeningStats } from '../types';

interface IntelligenceDashboardProps {
  records: ScreeningSession[];
  onSelectRecord: (record: ScreeningSession) => void;
}

const THROUGHPUT_DATA = [
  { time: '06:00', scanned: 142, cleared: 138, flagged: 4 },
  { time: '08:00', scanned: 289, cleared: 275, flagged: 14 },
  { time: '10:00', scanned: 412, cleared: 390, flagged: 22 },
  { time: '12:00', scanned: 530, cleared: 504, flagged: 26 },
  { time: '14:00', scanned: 478, cleared: 450, flagged: 28 },
  { time: '16:00', scanned: 610, cleared: 575, flagged: 35 },
  { time: '18:00', scanned: 520, cleared: 492, flagged: 28 },
  { time: '20:00', scanned: 340, cleared: 326, flagged: 14 },
];

const FORGERY_TECHNIQUES = [
  { name: 'Photo Splicing / Replacement', count: 48, fill: '#8b5cf6' },
  { name: 'MRZ Checksum / DOB Mismatch', count: 36, fill: '#f59e0b' },
  { name: 'Cloned / Forged Consular Stamp', count: 28, fill: '#ec4899' },
  { name: 'Facial Biometric Impersonation', count: 22, fill: '#ef4444' },
  { name: 'Interpol Red Notice / SLTD', count: 12, fill: '#dc2626' },
];

const DOCUMENT_TYPE_DISTRIBUTION = [
  { name: 'Passports', value: 58, fill: '#06b6d4' },
  { name: 'Visas', value: 24, fill: '#3b82f6' },
  { name: 'Border Permits', value: 12, fill: '#8b5cf6' },
  { name: 'National IDs', value: 6, fill: '#10b981' },
];

export const IntelligenceDashboard: React.FC<IntelligenceDashboardProps> = ({
  records,
  onSelectRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Compute live stats
  const totalScanned = records.length + 3321;
  const clearedCount = records.filter(r => r.status === 'CLEARED').length + 3180;
  const secondaryCount = records.filter(r => r.status === 'SECONDARY_INSPECTION').length + 95;
  const detainedCount = records.filter(r => r.status === 'DETAINED').length + 46;

  const filteredRecords = records.filter(rec => {
    const matchesSearch = 
      rec.travelerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.travelerPassportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.travelerNationality.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && rec.status === statusFilter;
  });

  const exportCSV = () => {
    const headers = ['Case ID,Timestamp,Traveler Name,Nationality,Passport No,Doc Type,Risk Score,Status,Decision'];
    const rows = records.map(r => 
      `"${r.id}","${r.timestamp}","${r.travelerName}","${r.travelerNationality}","${r.travelerPassportNumber}","${r.documentType}","${r.risk.overallRiskScore}","${r.status}","${r.risk.riskTier}"`
    );
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SSB_Screening_Intelligence_Log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Stat Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Scanned */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Scanned Today</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono text-white">
            {totalScanned.toLocaleString()}
          </span>
          <span className="text-[11px] text-cyan-400 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +14.2% peak volume
          </span>
        </div>

        {/* Cleared */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Cleared (e-Gate)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
            {clearedCount.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 font-medium mt-1">
            95.8% Automated Fast-Track
          </span>
        </div>

        {/* Secondary Review */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Secondary Review</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
            {secondaryCount}
          </span>
          <span className="text-[11px] text-slate-400 font-medium mt-1">
            Physical UV / Stamp checks
          </span>
        </div>

        {/* Detained / Forgeries */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Detained &amp; Forgeries</span>
            <AlertOctagon className="w-4 h-4 text-red-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono text-red-400">
            {detainedCount}
          </span>
          <span className="text-[11px] text-red-400 font-semibold mt-1">
            100% Intercept Accuracy
          </span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Checkpoint Throughput & Forgery Trend Chart */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Checkpoint Passenger Throughput &amp; Threat Detection Rate
              </h3>
              <p className="text-xs text-slate-400">Real-time scan load vs security anomaly flags</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Scanned
              </span>
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Flagged Forgeries
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={THROUGHPUT_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scannedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="flaggedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="scanned" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#scannedGrad)" />
                <Area type="monotone" dataKey="flagged" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#flaggedGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Forgery Techniques Breakdown */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-3 mb-4">
              Top Forgery Modus Operandi
            </h3>
            <div className="space-y-3">
              {FORGERY_TECHNIQUES.map((tech, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">{tech.name}</span>
                    <span className="font-mono font-bold text-white">{tech.count} cases</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(tech.count / 48) * 100}%`,
                        backgroundColor: tech.fill,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400 shrink-0" />
            <span>AI Multi-Spectral Splicing detection accounted for 33% of caught fraud.</span>
          </div>
        </div>
      </div>

      {/* Searchable Digital Intelligence Audit Trail */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Digital Screening Intelligence &amp; Case Audit Trail
            </h3>
            <p className="text-xs text-slate-400">Searchable log of all inspected travelers across SSB border terminals</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, passport#, case..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-52 sm:w-64"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="CLEARED">Cleared</option>
              <option value="SECONDARY_INSPECTION">Secondary</option>
              <option value="DETAINED">Detained</option>
            </select>

            {/* Export CSV */}
            <button
              onClick={exportCSV}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Case ID</th>
                <th className="py-2.5 px-3">Traveler Name</th>
                <th className="py-2.5 px-3">Passport / Permit</th>
                <th className="py-2.5 px-3">Nationality</th>
                <th className="py-2.5 px-3">Document</th>
                <th className="py-2.5 px-3 text-center">Risk Score</th>
                <th className="py-2.5 px-3">Decision</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {filteredRecords.map((rec) => {
                const isCleared = rec.status === 'CLEARED';
                const isSecondary = rec.status === 'SECONDARY_INSPECTION';
                const isDetained = rec.status === 'DETAINED';

                return (
                  <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">{rec.id}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{rec.travelerName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{rec.travelerPassportNumber}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{rec.travelerNationality}</td>
                    <td className="py-2.5 px-3 uppercase text-slate-400 text-[11px]">{rec.documentType.replace('_', ' ')}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-black">
                      <span className={`px-2 py-0.5 rounded ${
                        rec.risk.overallRiskScore > 65 ? 'bg-red-950 text-red-400 border border-red-800' :
                        rec.risk.overallRiskScore > 25 ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {rec.risk.overallRiskScore}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        isCleared ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        isSecondary ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-red-950 text-red-400 border border-red-800'
                      }`}>
                        {rec.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onSelectRecord(rec)}
                        className="px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-bold transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Inspect Case
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
