import React from 'react';
import { 
  LayoutGrid, 
  FileText, 
  Eye, 
  BarChart3, 
  Lock, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Plus,
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'screenings' | 'watchlist' | 'reports' | 'audit' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'screenings' | 'watchlist' | 'reports' | 'audit' | 'settings') => void;
  onNewScreening?: () => void;
  onLogout?: () => void;
  operatorId?: string;
  clearanceLevel?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onNewScreening,
  onLogout,
  operatorId = 'OPR-77A',
  clearanceLevel = 'Level 4 Clearance',
}) => {
  const menuItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutGrid },
    { id: 'screenings' as const, label: 'Screenings', icon: FileText },
    { id: 'watchlist' as const, label: 'Watchlist', icon: Eye },
    { id: 'reports' as const, label: 'Reports', icon: BarChart3 },
    { id: 'audit' as const, label: 'Audit Log', icon: Lock },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-[240px] bg-[#070d18] border-r border-[#152238] flex flex-col justify-between select-none h-screen text-slate-300 shrink-0 font-sans">
      {/* Top Branding & Nav */}
      <div>
        {/* Brand Header */}
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0e1d35] border border-[#1e3a66] flex items-center justify-center text-cyan-400">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-base font-black text-white tracking-widest leading-none font-mono">
                SENTINEL-ID
              </h1>
              <span className="text-[9px] font-mono tracking-widest text-slate-400 block mt-1 uppercase">
                Forensic Terminal
              </span>
            </div>
          </div>
        </div>

        {/* + NEW SCREENING Action Button */}
        <div className="px-4 mb-5">
          <button
            onClick={() => {
              if (onNewScreening) onNewScreening();
              setActiveTab('screenings');
            }}
            className="w-full py-2.5 px-3 bg-[#d4e4f7] hover:bg-white text-[#071326] font-bold text-xs uppercase tracking-wider rounded-md transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,228,247,0.15)]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            New Screening
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="px-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all relative ${
                  isActive
                    ? 'bg-[#121f35] text-white font-bold before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-cyan-400 before:rounded-r'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c1628]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Utilities */}
      <div className="p-3 border-t border-[#152238] space-y-2">
        <button className="w-full flex items-center gap-3 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-[#0c1628] rounded-md transition">
          <HelpCircle className="w-4 h-4" />
          <span>Help</span>
        </button>

        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-1.5 text-xs text-slate-400 hover:text-red-300 hover:bg-[#1a111a] rounded-md transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>

        {/* Officer User Pill */}
        <div className="pt-2 border-t border-[#121d30] flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
              alt="Officer Profile" 
              className="w-full h-full object-cover grayscale brightness-90 contrast-125"
            />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-white block font-mono leading-tight truncate">
              {operatorId}
            </span>
            <span className="text-[10px] text-slate-400 block font-mono truncate">
              {clearanceLevel}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
