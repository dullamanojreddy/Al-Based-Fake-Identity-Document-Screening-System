import React from 'react';
import { Search, Bell, Shield, RefreshCw } from 'lucide-react';

interface HeaderProps {
  activeScreeningId?: string;
  activeAlertsCount?: number;
  integrityStatus?: string;
  onRefresh?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeScreeningId,
  activeAlertsCount = 3,
  integrityStatus = 'Verified',
  onRefresh,
}) => {
  return (
    <header className="h-14 bg-[#08101e] border-b border-[#152238] px-6 flex items-center justify-between shrink-0 select-none text-slate-200">
      {/* Left: Search input or Active Case Banner */}
      <div className="flex items-center gap-4">
        {activeScreeningId ? (
          <div className="flex items-center gap-3">
            <span className="text-base font-black font-mono tracking-wider text-white">
              {activeScreeningId}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#1e141a] border border-[#4d1f28] text-[#f87171] text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_10px_rgba(248,113,113,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f87171] animate-pulse" />
              Active Screening
            </span>
          </div>
        ) : (
          <div className="relative w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search identities, cases, ID..."
              className="w-full bg-[#0c1628] border border-[#1b2b46] rounded-md pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>
        )}
      </div>

      {/* Center/Right: Integrity Status & Global Controls */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <span className="text-slate-400">Integrity Status:</span>
          <span className="text-white font-bold tracking-wide">{integrityStatus}</span>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-3 text-slate-400">
          <button className="p-1.5 hover:text-white hover:bg-[#121f35] rounded-md transition relative">
            <Bell className="w-4 h-4" />
            {activeAlertsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ef4444] ring-2 ring-[#08101e]" />
            )}
          </button>

          <button className="p-1.5 hover:text-white hover:bg-[#121f35] rounded-md transition">
            <Shield className="w-4 h-4" />
          </button>

          <button 
            onClick={onRefresh}
            className="p-1.5 hover:text-white hover:bg-[#121f35] rounded-md transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-800 border border-slate-700 ml-1">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Officer Profile"
              className="w-full h-full object-cover grayscale brightness-90 contrast-125"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
