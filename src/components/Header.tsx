import React, { useState } from 'react';
import { Search, Bell, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface HeaderProps {
  activeScreeningId?: string;
  activeAlertsCount?: number;
  integrityStatus?: string;
  onRefresh?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeScreeningId,
  activeAlertsCount = 0,
  integrityStatus = 'Operational',
  onRefresh,
}) => {
  const [isHealthOpen, setIsHealthOpen] = useState<boolean>(false);

  return (
    <header className="h-12 bg-white border-b border-slate-200 px-5 flex items-center justify-between shrink-0 select-none text-slate-700 relative">
      {/* Left: Search or Active Case */}
      <div className="flex items-center gap-4">
        {activeScreeningId ? (
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-bold font-mono text-slate-900">
              {activeScreeningId}
            </span>
            <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 text-[10px] font-semibold flex items-center gap-1.5 border border-red-100">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Active Screening
            </span>
          </div>
        ) : (
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search cases, identities, document IDs..."
              className="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-sans transition-colors"
            />
          </div>
        )}
      </div>

      {/* Right: Status & Controls */}
      <div className="flex items-center gap-4">
        {/* System Status */}
        <button
          onClick={() => setIsHealthOpen(!isHealthOpen)}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition"
          title="View subsystem status"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-slate-500">System:</span>
          <span className="text-slate-700 font-medium">{integrityStatus}</span>
        </button>

        {/* System Health Dropdown */}
        {isHealthOpen && (
          <div className="absolute right-20 top-12 w-72 bg-white border border-slate-200 rounded-lg shadow-lg p-4 z-50 text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-1">
              <span className="font-semibold text-slate-900">Subsystem Status</span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">6 of 7 online</span>
            </div>
            {[
              { name: 'OCR Engine', status: 'Operational', ok: true },
              { name: 'Document Classifier', status: 'Operational', ok: true },
              { name: 'MRZ 7-3-1 Engine', status: 'Operational', ok: true },
              { name: 'Forensic ELA Engine', status: 'Operational', ok: true },
              { name: 'Biometric Verifier', status: 'Operational', ok: true },
              { name: 'Audit Ledger', status: 'Synchronized', ok: true },
              { name: 'Government Gateway API', status: 'Not connected (standby)', ok: false },
            ].map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <span className={s.ok ? 'text-slate-700' : 'text-slate-400'}>{s.name}</span>
                <span className={`flex items-center gap-1 font-medium ${s.ok ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {s.ok
                    ? <CheckCircle2 className="w-3 h-3" />
                    : <AlertCircle className="w-3 h-3" />
                  }
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Icon controls */}
        <div className="flex items-center gap-1 text-slate-500">
          <button className="p-1.5 hover:text-slate-900 hover:bg-slate-100 rounded-md transition relative">
            <Bell className="w-4 h-4" />
            {activeAlertsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 border border-white" />
            )}
          </button>
          <button
            onClick={onRefresh}
            className="p-1.5 hover:text-slate-900 hover:bg-slate-100 rounded-md transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 border border-slate-300 ml-1">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Officer Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
