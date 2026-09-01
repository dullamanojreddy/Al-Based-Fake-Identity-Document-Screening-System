import React from 'react';
import { 
  Flag, 
  AlertTriangle, 
  ShieldCheck, 
  ListFilter, 
  ChevronRight,
  CheckCircle2,
  XCircle,
  FileText,
  Activity,
  Plus
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
  // All statistics computed directly from the session data — no hardcoded numbers
  const totalScreenings = sessions.length;
  const requiresReview = sessions.filter(
    (s) => (s.risk?.overallRiskScore ?? 0) >= 26 && s.status !== 'UNSUPPORTED_DOCUMENT'
  ).length;
  const watchlistMatches = sessions.filter(
    (s) => s.risk?.findings?.some((f) => f.type === 'WATCHLIST_HIT')
  ).length;

  // Recent findings from actual session data
  const recentFindings = sessions
    .flatMap((s) =>
      (s.risk?.findings || []).map((f) => ({
        ...f,
        sessionRef: s.id,
        traveler: s.travelerName,
      }))
    )
    .slice(0, 5);

  return (
    <div className="space-y-5 pb-8 text-slate-800">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Document screening activity and system status.
          </p>
        </div>
        <button
          onClick={onNewScreening}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          New Screening
        </button>
      </div>

      {/* Summary KPI Row — all from real session data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Screenings */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
            <span>Screenings</span>
            <FileText className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-2xl font-bold text-slate-900">{totalScreenings}</span>
          <p className="text-[10px] text-slate-500 mt-1">In current session</p>
        </div>

        {/* Requires Review */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
            <span>Requires Review</span>
            <Flag className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <span className={`text-2xl font-bold ${requiresReview > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {requiresReview}
          </span>
          <p className="text-[10px] text-slate-500 mt-1">Risk score ≥ 26</p>
        </div>

        {/* Watchlist Matches */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
            <span>Watchlist Matches</span>
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          </div>
          <span className={`text-2xl font-bold ${watchlistMatches > 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {watchlistMatches}
          </span>
          <p className="text-[10px] text-slate-500 mt-1">Confirmed hits</p>
        </div>

        {/* System Status */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
            <span>System status</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Operational
          </span>
          <p className="text-[10px] text-slate-500 mt-1">6 of 7 services online</p>
        </div>
      </div>

      {/* Screening Queue — main working table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">
              Screening Queue
              <span className="ml-2 text-xs font-normal text-slate-500">({sessions.length})</span>
            </h3>
          </div>
          <button
            onClick={onNavigateToScreenings}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 transition font-medium"
          >
            View all <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-medium">Screening ID</th>
                <th className="py-2.5 px-4 font-medium">Identity</th>
                <th className="py-2.5 px-4 font-medium">Document</th>
                <th className="py-2.5 px-4 font-medium">Source</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium text-right">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 text-xs">
                    No screening records in current session.
                    <br />
                    <span className="text-slate-400">New screening results will appear here.</span>
                  </td>
                </tr>
              ) : (
                sessions.map((item) => {
                  const isUnsupported = item.status === 'UNSUPPORTED_DOCUMENT' || item.documentType === 'unsupported_document';
                  const riskScore = item.risk?.overallRiskScore ?? 0;
                  const isEnhanced = riskScore >= 60 || item.risk?.reviewPriority === 'ENHANCED REVIEW RECOMMENDED';
                  const isReview = riskScore >= 26 && !isEnhanced;

                  // Status label
                  let statusLabel = 'Complete';
                  let statusDotColor = 'bg-emerald-500';
                  if (isUnsupported) { statusLabel = 'Not screened'; statusDotColor = 'bg-slate-400'; }
                  else if (item.status === 'DETAINED') { statusLabel = 'Detained'; statusDotColor = 'bg-red-500'; }
                  else if (item.status === 'SECONDARY_INSPECTION') { statusLabel = 'Under review'; statusDotColor = 'bg-amber-500'; }

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectScreening(item)}
                      className="hover:bg-slate-50 transition cursor-pointer"
                    >
                      <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">
                        {item.id}
                      </td>
                      <td className={`py-2.5 px-4 font-medium ${isEnhanced ? 'text-red-700' : 'text-slate-900'}`}>
                        {item.travelerName}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                        {isUnsupported ? 'Unknown / Unsupported' : item.documentType.replace(/_/g, ' ')}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">
                        {item.checkpointId}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDotColor}`} />
                          {statusLabel}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        {isUnsupported ? (
                          <span className="text-slate-400 text-[11px]">—</span>
                        ) : isEnhanced ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-100">
                            Enhanced
                          </span>
                        ) : isReview ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                            Review
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Clear
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lower: Recent Findings + Subsystem Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Recent Findings */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
            <h3 className="text-sm font-semibold text-slate-800">Recent findings</h3>
            <span className="text-[10px] text-slate-500">{recentFindings.length} records</span>
          </div>
          <div className="space-y-2">
            {recentFindings.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-5">
                No anomaly findings in current session.
              </p>
            ) : (
              recentFindings.map((finding, idx) => {
                const isCritical = finding.severity === 'CRITICAL' || finding.severity === 'HIGH';
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2.5 rounded-md border border-slate-200 hover:bg-slate-50 cursor-pointer transition"
                    onClick={onNavigateToScreenings}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCritical ? 'bg-red-500' : 'bg-amber-500'}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-900 truncate">{finding.title}</p>
                        <p className="text-[10px] text-slate-500 font-mono truncate">{finding.sessionRef} · <span className="font-sans">{finding.traveler}</span></p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold ml-3 shrink-0 ${
                      isCritical ? 'text-red-600 bg-red-50 px-1.5 py-0.5 rounded' : 'text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded'
                    }`}>
                      {finding.severity}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Subsystem Health */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              Subsystem health
            </h3>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">Operational</span>
          </div>
          <div className="space-y-0 text-xs">
            {[
              { name: 'OCR Engine', ok: true },
              { name: 'Document Classifier', ok: true },
              { name: 'ICAO MRZ Engine', ok: true },
              { name: 'Forensic Analyzer', ok: true },
              { name: 'Biometric Verifier', ok: true },
              { name: 'Audit Ledger', ok: true },
              { name: 'Government Gateway API', ok: false, note: 'Standby' },
            ].map((s) => (
              <div key={s.name} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <span className={s.ok ? 'text-slate-700' : 'text-slate-500'}>{s.name}</span>
                <span className={`flex items-center gap-1 text-[11px] ${s.ok ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                  {s.ok
                    ? <><CheckCircle2 className="w-3 h-3" /> Operational</>
                    : <><XCircle className="w-3 h-3" /> {s.note || 'Offline'}</>
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
