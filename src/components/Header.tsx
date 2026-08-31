import React, { useState, useEffect } from 'react';
import { Shield, Bell, Volume2, VolumeX, LogOut, Radio, Clock, UserCheck } from 'lucide-react';

interface HeaderProps {
  onLogout: () => void;
  checkpointName?: string;
  officerBadge?: string;
  officerName?: string;
  activeAlertsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onLogout,
  checkpointName = 'Raxaul Integrated Check Post (ICP-04)',
  officerBadge = 'SSB-7092',
  officerName = 'Insp. Vikram Rathore',
  activeAlertsCount = 2,
}) => {
  const [time, setTime] = useState<string>('');
  const [isAudioAlertEnabled, setIsAudioAlertEnabled] = useState<boolean>(true);

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-800 flex items-center justify-center text-white shadow-lg shadow-cyan-950 border border-cyan-500/40">
            <Shield className="w-5 h-5 text-cyan-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-wider uppercase text-white">
                SASHASTRA SEEMA BAL (SSB)
              </span>
              <span className="bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-mono px-1.5 py-0.2 rounded font-bold">
                MHA POLICE II
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              AI-Based Fake Identity &amp; Document Screening System (SIH26188)
            </p>
          </div>
        </div>

        {/* Right Station & Officer Status */}
        <div className="flex items-center gap-3 text-xs">
          {/* Station Mode Indicator */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-slate-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-bold">ONLINE</span>
            <span className="text-slate-600">|</span>
            <span className="text-[11px] truncate max-w-[200px]">{checkpointName}</span>
          </div>

          {/* Clock */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-cyan-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{time} IST</span>
          </div>

          {/* Audio Toggle */}
          <button
            onClick={() => setIsAudioAlertEnabled(!isAudioAlertEnabled)}
            title={isAudioAlertEnabled ? 'Mute Sirens' : 'Enable Sirens'}
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition"
          >
            {isAudioAlertEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Officer Info */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <div className="text-left leading-tight">
              <span className="font-bold text-white block text-[11px]">{officerName}</span>
              <span className="text-[9px] font-mono text-slate-400">{officerBadge}</span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            title="Log Out Officer"
            className="p-2 bg-red-950/60 border border-red-800/80 hover:bg-red-900 text-red-300 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
