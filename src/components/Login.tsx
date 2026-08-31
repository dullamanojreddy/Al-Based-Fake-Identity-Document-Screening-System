import React, { useState } from 'react';
import { Shield, Lock, UserCheck, MapPin, Radio, KeyRound, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [badgeId, setBadgeId] = useState('SSB-7092');
  const [station, setStation] = useState('ICP-RAXAUL-04');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem('auth_token', 'ssb_secure_token_session_2026');
      localStorage.setItem('auth_user', JSON.stringify({
        badgeId,
        station,
        name: 'Insp. Vikram Rathore',
      }));
      setIsLoading(false);
      onLogin();
    }, 600);
  };

  const handleQuickDemoLogin = () => {
    localStorage.setItem('auth_token', 'ssb_secure_token_session_2026');
    localStorage.setItem('auth_user', JSON.stringify({
      badgeId: 'SSB-7092',
      station: 'ICP-RAXAUL-04',
      name: 'Insp. Vikram Rathore',
    }));
    onLogin();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
      {/* Background Military Tactical Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #06b6d4 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Top Header */}
      <div className="flex items-center justify-between max-w-6xl w-full mx-auto relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-900 flex items-center justify-center border border-cyan-400/40 shadow-lg shadow-cyan-950">
            <Shield className="w-5 h-5 text-cyan-200" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider uppercase">
              MINISTRY OF HOME AFFAIRS • POLICE II
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">
              SASHASTRA SEEMA BAL (SSB) BORDER SCREENING GRID
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-bold">GRID ONLINE</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto relative z-10">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-tr from-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-cyan-400/40 shadow-lg shadow-cyan-950">
              <KeyRound className="w-7 h-7 text-cyan-100" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-wide text-white">
              Officer Station Login
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              AI-Based Fake Identity &amp; Document Screening System (SIH26188)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Officer Badge ID
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Checkpoint Terminal Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={station}
                  onChange={(e) => setStation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="ICP-RAXAUL-04">Raxaul Integrated Check Post (ICP-04)</option>
                  <option value="ICP-PANITANKI-02">Panitanki Border Check Post (ICP-02)</option>
                  <option value="ICP-SONAULI-01">Sonauli Integrated Check Post (ICP-01)</option>
                  <option value="ICP-JAYNAGAR-03">Jaynagar Border Terminal (ICP-03)</option>
                  <option value="IGI-DELHI-T3">IGI Airport Immigration Terminal-3 (DEL)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Cryptographic Access Passcode
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 mt-2"
            >
              {isLoading ? 'Authenticating Credentials...' : 'Authenticate & Open Checkpoint Terminal'}
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Access */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-slate-800 rounded-xl text-xs font-mono font-semibold transition text-center"
              >
                ⚡ 1-Click Evaluation Login (Inspector Vikram Rathore)
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-[11px] text-slate-500 relative z-10">
        © 2026 Smart India Hackathon (SIH26188) • Ministry of Home Affairs • Sashastra Seema Bal
      </div>
    </div>
  );
};