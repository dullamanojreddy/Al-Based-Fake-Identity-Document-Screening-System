import React from 'react';
import { ShieldAlert, ShieldCheck, AlertOctagon, UserX, Globe, BellRing } from 'lucide-react';
import { WatchlistResult } from '../types';

interface WatchlistAlertCardProps {
  watchlist: WatchlistResult;
}

export const WatchlistAlertCard: React.FC<WatchlistAlertCardProps> = ({ watchlist }) => {
  const { isHit, matchType, threatLevel, matchedAlias, interpolNoticeId, details, actionRequired, watchlistDatabase } = watchlist;

  const isCritical = threatLevel === 'CRITICAL';
  const isHigh = threatLevel === 'HIGH';

  return (
    <div
      className={`border rounded-2xl p-5 shadow-xl transition-all ${
        isHit
          ? isCritical
            ? 'bg-red-950/60 border-red-600 ring-2 ring-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.3)]'
            : 'bg-amber-950/50 border-amber-600'
          : 'bg-slate-900 border-slate-800'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          {isHit ? (
            <AlertOctagon className="w-5 h-5 text-red-400 animate-bounce" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          )}
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Interpol &amp; SSB National Watchlist Screening
          </h3>
        </div>
        <span
          className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
            isHit
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
          }`}
        >
          {isHit ? `THREAT LEVEL: ${threatLevel}` : 'CLEAR (0 MATCHES)'}
        </span>
      </div>

      {isHit ? (
        <div className="space-y-3">
          <div className="bg-red-900/40 border border-red-700/80 rounded-xl p-3 flex items-start gap-3">
            <div className="p-2 bg-red-600 rounded-lg text-white shrink-0 mt-0.5">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-red-300 uppercase block">
                {matchType.replace(/_/g, ' ')}
              </span>
              <h4 className="text-sm font-extrabold text-white mb-1">
                {interpolNoticeId ? `Ref: ${interpolNoticeId}` : 'Database Match Flagged'}
              </h4>
              <p className="text-xs text-red-100 leading-relaxed">{details}</p>
            </div>
          </div>

          {matchedAlias && (
            <div className="bg-slate-950/90 rounded-xl p-3 border border-red-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">Flagged Fugitive Alias:</span>
              <span className="text-xs font-mono font-bold text-red-400">{matchedAlias}</span>
            </div>
          )}

          <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
              Required Checkpoint Protocol:
            </span>
            <p className="text-xs font-semibold text-amber-300 font-sans">{actionRequired}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300">
          <Globe className="w-5 h-5 text-cyan-400 shrink-0" />
          <div>
            <span className="font-bold text-white block">Central Databases Queried:</span>
            <span>INTERPOL Red Notices, INTERPOL SLTD (Stolen/Lost Documents), and SSB Police II National Blacklist. No warrants or flags detected.</span>
          </div>
        </div>
      )}
    </div>
  );
};
