import React from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Database, 
  Cpu, 
  Sliders, 
  FileText, 
  LogOut, 
  ShieldCheck, 
  Layers,
  Sparkles
} from 'lucide-react';

export type MainTab = 'screening' | 'intelligence' | 'watchlist' | 'settings';

interface SidebarProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onLogout,
}) => {
  const navItems = [
    {
      id: 'screening' as MainTab,
      label: 'Screening Station',
      subtitle: 'Real-Time Inspection Terminal',
      icon: ShieldAlert,
      badge: 'LIVE',
    },
    {
      id: 'intelligence' as MainTab,
      label: 'Intelligence & Audit',
      subtitle: 'Analytics & Case Dossiers',
      icon: Activity,
    },
    {
      id: 'watchlist' as MainTab,
      label: 'Interpol & Watchlist',
      subtitle: 'National Blacklist DB',
      icon: Database,
      badge: 'SYNCED',
    },
    {
      id: 'settings' as MainTab,
      label: 'Hardware & AI Engine',
      subtitle: 'Optics, ELA & ICAO Config',
      icon: Sliders,
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 p-4 min-h-screen">
      <div>
        {/* Navigation Items */}
        <div className="space-y-2 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full p-3 rounded-xl text-left transition-all duration-200 flex items-center justify-between group ${
                  isActive
                    ? 'bg-cyan-600/20 text-white border border-cyan-500/40 shadow-lg shadow-cyan-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg transition ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 group-hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">{item.label}</span>
                    <span className="text-[10px] text-slate-500 block">{item.subtitle}</span>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      item.badge === 'LIVE'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 animate-pulse'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Checkpoint Summary & Log Out */}
      <div className="space-y-3 pt-4 border-t border-slate-800/80">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-400">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1">
            <span>SSB Network Node</span>
            <span className="text-emerald-400 font-mono">ONLINE</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Encrypted TLS 1.3 link to Ministry of Home Affairs Central Intelligence Grid.
          </p>
        </div>

        <button
          onClick={onLogout}
          className="w-full py-2.5 bg-slate-900 hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-slate-800 hover:border-red-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          End Officer Shift (Logout)
        </button>
      </div>
    </aside>
  );
};
