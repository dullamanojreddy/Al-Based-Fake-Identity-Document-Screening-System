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
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'new_screening' | 'screenings' | 'watchlist' | 'reports' | 'audit' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'new_screening' | 'screenings' | 'watchlist' | 'reports' | 'audit' | 'settings') => void;
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
  operatorId = 'OPR-7742',
  clearanceLevel = 'Clearance Lvl 4',
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
    <aside className="w-[230px] bg-slate-50 border-r border-slate-200 flex flex-col justify-between select-none h-screen text-slate-700 shrink-0">
      {/* Top Branding & Nav */}
      <div>
        {/* Brand Header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-white border border-slate-300 shadow-sm flex items-center justify-center">
              <ShieldCheck className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight tracking-tight">
                FIDSS
              </h1>
              <span className="text-[10px] text-slate-500 block leading-tight">
                Identity & Document Screening
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-2 pt-3 space-y-0.5 mb-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all relative ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-600 before:rounded-r'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* + New Screening Button */}
        <div className="px-3">
          <button
            onClick={() => {
              if (onNewScreening) onNewScreening();
              setActiveTab('new_screening');
            }}
            className={`w-full py-2 px-3 font-semibold text-xs rounded-md transition flex items-center justify-center gap-1.5 ${
              activeTab === 'new_screening'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white hover:bg-slate-50 text-blue-600 border border-slate-200 shadow-sm'
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            New Screening
          </button>
        </div>
      </div>

      {/* Bottom Profile & Utilities */}
      <div className="p-3 border-t border-slate-200 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition">
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Help</span>
        </button>

        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-1.5 text-xs text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition"
        >
          <LogOut className="w-4 h-4 text-slate-400" />
          <span>Sign Out</span>
        </button>

        {/* Officer User Row */}
        <div className="pt-2 border-t border-slate-200 flex items-center gap-2.5 px-2 py-1 mt-1">
          <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
              alt="Officer Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-slate-900 block font-mono leading-tight truncate">
              {operatorId}
            </span>
            <span className="text-[10px] text-slate-500 block truncate">
              {clearanceLevel}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
