import React from 'react';
import { AlertOctagon, AlertTriangle, Info, ShieldAlert, CheckCircle2, Eye } from 'lucide-react';
import { ScreeningFinding, FindingSeverity } from '../types';

interface ForensicFindingsPanelProps {
  findings: ScreeningFinding[];
  onHighlightRegion?: (bbox?: ScreeningFinding['boundingBox']) => void;
}

export const ForensicFindingsPanel: React.FC<ForensicFindingsPanelProps> = ({
  findings = [],
  onHighlightRegion,
}) => {
  const getSeverityBadge = (severity: FindingSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded font-mono font-bold text-[10px] flex items-center gap-1 animate-pulse">
            <AlertOctagon className="w-3 h-3" /> CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="bg-red-900/60 text-red-300 border border-red-700 px-2 py-0.5 rounded font-mono font-bold text-[10px] flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded font-mono font-bold text-[10px] flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
            LOW
          </span>
        );
      default:
        return (
          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold text-[10px] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> PASS
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Explainable Forensic Findings ({findings.length})
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
          INDEPENDENT EVIDENCE
        </span>
      </div>

      {findings.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-xs">
          No anomalous forensic findings detected. Document passed validation checks.
        </div>
      ) : (
        <div className="space-y-2.5">
          {findings.map((finding) => (
            <div
              key={finding.id}
              className={`p-3.5 rounded-xl border transition-all ${
                finding.severity === 'CRITICAL'
                  ? 'bg-red-950/40 border-red-700/80 shadow-[0_0_15px_rgba(220,38,38,0.2)]'
                  : finding.severity === 'HIGH'
                  ? 'bg-red-950/20 border-red-800/60'
                  : finding.severity === 'MEDIUM'
                  ? 'bg-amber-950/20 border-amber-800/60'
                  : 'bg-slate-950/80 border-slate-800/80'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  {getSeverityBadge(finding.severity)}
                  <span className="text-xs font-mono font-bold text-slate-400">
                    [{finding.sourceModule}]
                  </span>
                  <h4 className="text-xs font-bold text-white">{finding.title}</h4>
                </div>

                {finding.boundingBox && onHighlightRegion && (
                  <button
                    onClick={() => onHighlightRegion(finding.boundingBox)}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-semibold rounded transition inline-flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" /> Locate Region
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans pl-1">
                {finding.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
