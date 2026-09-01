import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import {
  Download,
  AlertTriangle,
  FileText,
  Search,
  Eye,
  ShieldAlert
} from 'lucide-react';
import { ScreeningSession } from '../types';

interface SystemAnalyticsViewProps {
  sessions: ScreeningSession[];
  onSelectSession: (session: ScreeningSession) => void;
}

export const SystemAnalyticsView: React.FC<SystemAnalyticsViewProps> = ({
  sessions = [],
  onSelectSession,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  // All metrics derived from actual session data
  const totalScreenings = sessions.length;
  const anomalyCount = sessions.filter(
    (s) => s.risk?.findings?.some((f) => f.severity === 'HIGH' || f.severity === 'CRITICAL')
  ).length;
  const watchlistHits = sessions.filter(
    (s) => s.risk?.findings?.some((f) => f.type === 'WATCHLIST_HIT')
  ).length;

  // Risk distribution from real data
  const clearCount = sessions.filter((s) => (s.risk?.overallRiskScore ?? 0) < 26).length;
  const reviewCount = sessions.filter(
    (s) => (s.risk?.overallRiskScore ?? 0) >= 26 && (s.risk?.overallRiskScore ?? 0) < 60
  ).length;
  const enhancedCount = sessions.filter((s) => (s.risk?.overallRiskScore ?? 0) >= 60).length;

  // Document type breakdown from real data
  const docTypeCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    const t = s.documentType || 'unknown';
    docTypeCounts[t] = (docTypeCounts[t] || 0) + 1;
  });
  const docTypeData = Object.entries(docTypeCounts).map(([name, count]) => ({
    name: name.replace(/_/g, ' '),
    count,
  }));

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
    a.download = `FIDSS_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const filteredSessions = sessions.filter((s) =>
    s.travelerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.travelerPassportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-12 text-slate-800">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Screening outcomes and document analysis summary for the current session.
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-md transition flex items-center gap-2 border border-slate-200 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      {/* KPI Row — all real data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">Total screenings</span>
            <FileText className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-3xl font-bold text-slate-900 font-mono">{totalScreenings}</span>
          <p className="text-[10px] text-slate-500 mt-1.5">Current session only</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">With anomaly findings</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <span className={`text-3xl font-bold font-mono ${anomalyCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {anomalyCount}
          </span>
          <p className="text-[10px] text-slate-500 mt-1.5">
            {totalScreenings > 0
              ? `${((anomalyCount / totalScreenings) * 100).toFixed(1)}% of screened documents`
              : 'No data available'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">Watchlist matches</span>
            <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
          </div>
          <span className={`text-3xl font-bold font-mono ${watchlistHits > 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {watchlistHits}
          </span>
          <p className="text-[10px] text-slate-500 mt-1.5">
            {watchlistHits > 0 ? 'Requires immediate review' : 'No watchlist matches'}
          </p>
        </div>
      </div>

      {/* Charts Row — only shown when there is actual data */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Risk distribution — real data */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2.5 mb-3">
              Risk distribution
            </h3>
            <div className="space-y-4 mt-2">
              {[
                { label: 'Clear', count: clearCount, color: 'bg-emerald-500', textColor: 'text-emerald-700' },
                { label: 'Review required', count: reviewCount, color: 'bg-amber-500', textColor: 'text-amber-700' },
                { label: 'Enhanced review', count: enhancedCount, color: 'bg-red-500', textColor: 'text-red-700' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-600">{row.label}</span>
                    <span className={`font-semibold font-mono ${row.textColor}`}>
                      {row.count}
                      {totalScreenings > 0 && (
                        <span className="text-slate-500 font-sans font-normal ml-1.5">
                          ({((row.count / totalScreenings) * 100).toFixed(0)}%)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${row.color}`}
                      style={{ width: totalScreenings > 0 ? `${(row.count / totalScreenings) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Document type breakdown — real data */}
          {docTypeData.length > 0 && (
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2.5 mb-3">
                Document types screened
              </h3>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={docTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '11px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Count" maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {sessions.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center shadow-sm">
          <p className="text-slate-600 text-sm font-medium">No report data available.</p>
          <p className="text-slate-500 text-xs mt-1">Complete a screening to generate report data.</p>
        </div>
      )}

      {/* Case Log Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 bg-slate-50/50">
          <h3 className="text-sm font-semibold text-slate-800">Case archive</h3>
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, ID, passport..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-medium">Case ID</th>
                <th className="py-2.5 px-4 font-medium">Traveler name</th>
                <th className="py-2.5 px-4 font-medium">Document no.</th>
                <th className="py-2.5 px-4 font-medium">Nationality</th>
                <th className="py-2.5 px-4 font-medium text-center">Risk score</th>
                <th className="py-2.5 px-4 font-medium">Outcome</th>
                <th className="py-2.5 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 text-xs">
                    {searchQuery ? `No results for "${searchQuery}".` : 'No screening records available.'}
                  </td>
                </tr>
              ) : (
                filteredSessions.map((rec) => {
                  const score = rec.risk?.overallRiskScore ?? 0;
                  const isHigh = score > 60;
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">{rec.id}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">{rec.travelerName}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-500">{rec.travelerPassportNumber || '—'}</td>
                      <td className="py-2.5 px-4 text-slate-600">{rec.travelerNationality || '—'}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${
                          isHigh ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {rec.risk ? `${rec.risk.overallRiskScore}` : '—'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 text-[11px] capitalize">
                        {rec.status?.toLowerCase().replace(/_/g, ' ') || '—'}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => onSelectSession(rec)}
                          className="px-2.5 py-1.5 bg-white text-blue-600 hover:bg-slate-50 border border-slate-200 rounded text-[11px] font-medium transition inline-flex items-center gap-1 shadow-sm"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
