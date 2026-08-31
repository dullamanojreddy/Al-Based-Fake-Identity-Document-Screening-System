import React from 'react';
import { 
  ScanLine, 
  BarChart3, 
  Users, 
  Settings, 
  ShieldCheck, 
  HelpCircle, 
  Lock, 
  Cpu, 
  BookOpen
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'screening' | 'intelligence' | 'watchlist' | 'audit' | 'models' | 'settings';
  setActiveTab: (tab: 'screening' | 'intelligence' | 'watchlist' | 'audit' | 'models' | 'settings') => void;
  activeScreeningsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeScreeningsCount = 4,
}) => {
  const navItems = [
    {
      id: 'screening' as const,
      label: 'Screening Station',
      subtitle: 'Primary OCR & Forensic Inspector',
      icon: ScanLine,
      badge: `${activeScreeningsCount} Active`,
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    },
    {
      id: 'intelligence' as const,
      label: 'Threat Analytics',
      subtitle: 'Checkpoint Throughput & Forgery Trends',
      icon: BarChart3,
    },
    {
      id: 'watchlist' as const,
      label: 'Interpol & Watchlist',
      subtitle: 'Red Notices & SLTD Fugitive Database',
      icon: Users,
      badge: '1 Alert',
      badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse',
    },
    {
      id: 'audit' as const,
      label: 'Cryptographic Audit',
      subtitle: 'Tamper-Evident SHA-256 Hash Ledger',
      icon: Lock,
      badge: 'Verified',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      id: 'models' as const,
      label: 'AI Model Registry',
      subtitle: 'Weights Hashes & Reproducibility',
      icon: Cpu,
    },
    {
      id: 'settings' as const,
      label: 'Diagnostic Settings',
      subtitle: 'Thresholds, ELA Gain & Biometrics',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0 select-none">
      {/* Top Nav Items */}
      <div className="space-y-6">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase px-3 block mb-2">
            Command Modules
          </span>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-950/80 text-white border border-cyan-500/40 shadow-lg shadow-cyan-950/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <div>
                      <span className={`text-xs font-bold block ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {item.label}
                      </span>
                      <span className="text-[10px] text-slate-400 block line-clamp-1">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>

                  {item.badge && (
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* SIH Hackathon Meta */}
        <div className="bg-slate-950/80 rounded-2xl p-3.5 border border-slate-800/80">
          <div className="flex items-center gap-2 text-amber-400 mb-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">SIH 2026 Ready</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
            MHA SSB Problem Statement <strong>SIH26188</strong>: AI Document Forensics &amp; Biometric Screening System.
          </p>
        </div>
      </div>

      {/* Bottom Status */}
      <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between font-mono">
        <span>Sentinel v2.5.0</span>
        <span className="text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ONLINE
        </span>
      </div>
    </aside>
  );
};
