import React, { useState } from 'react';
import { Database, Search, ShieldAlert, Globe, UserX, AlertTriangle, Plus, CheckCircle2 } from 'lucide-react';

interface WatchlistEntry {
  id: string;
  name: string;
  aliases: string[];
  nationality: string;
  dob: string;
  interpolNoticeId?: string;
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  offenseCategory: string;
  issuingCountry: string;
  status: 'ACTIVE_WARRANT' | 'DETAIN_ON_SIGHT' | 'BORDER_INTERCEPT';
}

const INITIAL_WATCHLIST: WatchlistEntry[] = [
  {
    id: 'WL-001',
    name: 'VLADIMIR IVANOV',
    aliases: ['Maximilian Klaus Weber', 'Viktor Sidorov'],
    nationality: 'AUT / RUS',
    dob: '1981-05-19',
    interpolNoticeId: 'RN-2025/88921-EU',
    threatLevel: 'CRITICAL',
    offenseCategory: 'Transnational Syndicate Fraud & Identity Laundering',
    issuingCountry: 'Interpol Lyon / Europol',
    status: 'DETAIN_ON_SIGHT',
  },
  {
    id: 'WL-002',
    name: 'TARIQ MAHMOUD AL-HASSAN',
    aliases: ['Tariq Al-Masri'],
    nationality: 'SYR',
    dob: '1985-03-10',
    threatLevel: 'HIGH',
    offenseCategory: 'Forged Schengen Visa Distribution & Border Smuggling',
    issuingCountry: 'France / Schengen VIS',
    status: 'BORDER_INTERCEPT',
  },
  {
    id: 'WL-003',
    name: 'DAVID JAMES STERLING',
    aliases: ['David Miller'],
    nationality: 'GBR',
    dob: '1982-08-15',
    threatLevel: 'MEDIUM',
    offenseCategory: 'Immigration Act Section 14 Overstay & Age Falsification',
    issuingCountry: 'India (MHA Immigration)',
    status: 'ACTIVE_WARRANT',
  },
  {
    id: 'WL-004',
    name: 'CARLOS ENRIQUE MENDEZ',
    aliases: ['Antonio Gomez'],
    nationality: 'MEX',
    dob: '1979-12-04',
    interpolNoticeId: 'RN-2024/51029-AM',
    threatLevel: 'CRITICAL',
    offenseCategory: 'Cross-Border Narcotics Trafficking & False Documentation',
    issuingCountry: 'Interpol / DEA',
    status: 'DETAIN_ON_SIGHT',
  },
];

export const WatchlistDatabaseView: React.FC = () => {
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>(INITIAL_WATCHLIST);
  const [search, setSearch] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newNationality, setNewNationality] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('');
  const [newThreat, setNewThreat] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('HIGH');

  const filtered = watchlist.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.nationality.toLowerCase().includes(search.toLowerCase()) ||
    w.offenseCategory.toLowerCase().includes(search.toLowerCase()) ||
    w.aliases.some(a => a.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const newEntry: WatchlistEntry = {
      id: `WL-${(watchlist.length + 1).toString().padStart(3, '0')}`,
      name: newName.toUpperCase(),
      aliases: [],
      nationality: newNationality.toUpperCase() || 'UNKNOWN',
      dob: '1990-01-01',
      threatLevel: newThreat,
      offenseCategory: newCategory || 'Immigration Document Fraud',
      issuingCountry: 'SSB Police II Division',
      status: 'BORDER_INTERCEPT',
    };

    setWatchlist([newEntry, ...watchlist]);
    setNewName('');
    setNewNationality('');
    setNewCategory('');
    setIsAddingNew(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold uppercase tracking-wider text-white">
              INTERPOL &amp; National SSB Watchlist Grid
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time biometric cross-referencing against Interpol Red Notices, SLTD, and Police II alerts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search fugitive name, alias..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-60"
            />
          </div>

          <button
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Suspect Alert
          </button>
        </div>
      </div>

      {/* Add Suspect Form Modal/Drawer */}
      {isAddingNew && (
        <form onSubmit={handleAdd} className="bg-slate-900 border border-cyan-500/40 p-4 rounded-2xl shadow-xl space-y-3 animate-in fade-in">
          <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
            Issue New Checkpoint Intercept Notice
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Suspect Full Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            />
            <input
              type="text"
              placeholder="Nationality (e.g. IND, NPL)"
              value={newNationality}
              onChange={(e) => setNewNationality(e.target.value)}
              className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            />
            <input
              type="text"
              placeholder="Offense / Forgery Type"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            />
            <select
              value={newThreat}
              onChange={(e) => setNewThreat(e.target.value as any)}
              className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            >
              <option value="CRITICAL">Critical (Red Notice)</option>
              <option value="HIGH">High Threat</option>
              <option value="MEDIUM">Medium / Overstay</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-cyan-600 text-white rounded-lg text-xs font-bold"
            >
              Register Alert
            </button>
          </div>
        </form>
      )}

      {/* Grid of Suspect Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`bg-slate-900 border rounded-2xl p-5 shadow-xl flex flex-col justify-between ${
              item.threatLevel === 'CRITICAL'
                ? 'border-red-600/80 bg-red-950/20'
                : 'border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400">{item.id}</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      item.threatLevel === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse' :
                      item.threatLevel === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {item.threatLevel} THREAT
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white mt-1">{item.name}</h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Origin</span>
                  <span className="text-xs font-bold text-white font-mono">{item.nationality}</span>
                </div>
              </div>

              {item.aliases.length > 0 && (
                <div className="text-xs text-slate-400 mb-2">
                  <span className="font-semibold text-slate-300">Known Aliases: </span>
                  {item.aliases.join(', ')}
                </div>
              )}

              <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 mb-3">
                <strong className="text-slate-400 block mb-0.5 font-sans">Offense Summary:</strong>
                {item.offenseCategory}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Issuing Org: <strong className="text-slate-300 font-sans">{item.issuingCountry}</strong></span>
              <span className="text-red-400 font-bold">{item.status.replace(/_/g, ' ')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
