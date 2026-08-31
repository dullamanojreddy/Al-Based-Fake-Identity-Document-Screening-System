import React, { useState } from 'react';
import { Search, Bell, Shield, RefreshCw, Activity, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface HeaderProps {
  activeScreeningId?: string;
  activeAlertsCount?: number;
  integrityStatus?: string;
  onRefresh?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeScreeningId,
  activeAlertsCount = 3,
  integrityStatus = 'OPERATIONAL',
  onRefresh,
}) => {
  const [isHealthModalOpen, setIsHealthModalOpen] = useState<boolean>(false);

  return (
    <header className="h-14 bg-[#08101e] border-b border-[#152238] px-6 flex items-center justify-between shrink-0 select-none text-slate-200 relative">
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
          <div className="relative w-84">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search identities, cases, document IDs..."
              className="w-full bg-[#0c1628] border border-[#1b2b46] rounded-md pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>
        )}
      </div>

      {/* Center/Right: Dynamic System Status & Controls */}
      <div className="flex items-center gap-5">
        {/* Dynamic System Status Trigger */}
        <button
          onClick={() => setIsHealthModalOpen(!isHealthModalOpen)}
          className="flex items-center gap-2 px-3 py-1 bg-[#0c1628] hover:bg-[#121f35] border border-[#1b2b46] rounded-md text-xs font-mono transition"
          title="Click to view live subsystem status"
        >
          <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-slate-400 uppercase text-[10px] font-bold">SYSTEM STATUS:</span>
          <span className="text-white font-bold tracking-wider">{integrityStatus}</span>
        </button>

        {/* System Health Dropdown Popup */}
        {isHealthModalOpen && (
          <div className="absolute right-24 top-14 w-80 bg-[#0b1424] border border-[#1e304f] rounded-xl shadow-2xl p-4 z-50 text-xs font-mono space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#182740] pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white uppercase tracking-wider">System Health</span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">
                6/7 ONLINE
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">OCR Engine</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Operational
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Document Classifier</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Operational
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">MRZ 7-3-1 Engine</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Operational
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Forensic ELA Engine</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Operational
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Biometric Nodal Engine</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Operational
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Database Cache</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-[#182740] pt-1.5">
                <span className="text-slate-400">Government Gateway API</span>
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-slate-500" /> Not Connected (Standby)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Icons */}
        <div className="flex items-center gap-2.5 text-slate-400">
          <button className="p-1.5 hover:text-white hover:bg-[#121f35] rounded-md transition relative">
            <Bell className="w-4 h-4" />
            {activeAlertsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ef4444] ring-2 ring-[#08101e]" />
            )}
          </button>

          <button 
            onClick={onRefresh}
            className="p-1.5 hover:text-white hover:bg-[#121f35] rounded-md transition"
            title="Refresh screening data"
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
