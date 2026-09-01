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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-6xl w-full mx-auto relative z-10 mt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900">
              MINISTRY OF HOME AFFAIRS • POLICE II
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              SASHASTRA SEEMA BAL (SSB) BORDER SCREENING GRID
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-lg font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-slate-700">GRID ONLINE</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto relative z-10">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4 border border-slate-200">
              <KeyRound className="w-6 h-6 text-slate-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Officer Station Login
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Identity & Document Screening System (SIH26188)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Officer Badge ID
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Checkpoint Terminal Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={station}
                  onChange={(e) => setStation(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow appearance-none"
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
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Cryptographic Access Passcode
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 mt-4 shadow-sm"
            >
              {isLoading ? 'Authenticating...' : 'Authenticate & Access Terminal'}
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Access */}
            <div className="pt-3 border-t border-slate-100 mt-6">
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-medium transition text-center"
              >
                Use Quick Demo Login (Insp. Vikram Rathore)
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-slate-500 relative z-10 pb-4 font-medium">
        © 2026 Smart India Hackathon (SIH26188) • Ministry of Home Affairs • Sashastra Seema Bal
      </div>
    </div>
  );
};