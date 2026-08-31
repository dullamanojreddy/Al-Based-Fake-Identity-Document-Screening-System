import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  AlertOctagon, 
  Plus, 
  ShieldAlert, 
  Trash2, 
  CheckCircle2, 
  Eye, 
  Globe 
} from 'lucide-react';

interface WatchlistEntry {
  id: string;
  name: string;
  aliases: string[];
  nationality: string;
  dob: string;
  passportNum: string;
  noticeType: 'INTERPOL_RED_NOTICE' | 'INTERPOL_SLTD' | 'SSB_BLACKLIST' | 'FRAUD_SUSPECT';
  category: string;
  issuedDate: string;
  status: 'ACTIVE_WARRANT' | 'UNDER_SURVEILLANCE' | 'DETAINED';
  summary: string;
}

const INITIAL_WATCHLIST: WatchlistEntry[] = [
  {
    id: 'WL-INT-2025-001',
    name: 'VLADIMIR IVANOV',
    aliases: ['Maximilian Weber', 'Klaus Weber', 'V. Groznyi'],
    nationality: 'AUT / RUS',
    dob: '1981-05-19',
    passportNum: 'A77192083',
    noticeType: 'INTERPOL_RED_NOTICE',
    category: 'Transnational Syndicate Fraud & Identity Laundering',
    issuedDate: '2025-08-14',
    status: 'ACTIVE_WARRANT',
    summary: 'Wanted by Austrian Federal Criminal Police & Europol for forging 40+ diplomatic travel passports.',
  },
  {
    id: 'WL-SSB-2026-042',
    name: 'TARIQ AHMED MIRZA',
    aliases: ['T. A. Mirza', 'Ahmed Khan'],
    nationality: 'PAK',
    dob: '1979-11-03',
    passportNum: 'PA8829104',
    noticeType: 'SSB_BLACKLIST',
    category: 'Cross-Border Smuggling & Counterfeit Visa Distribution',
    issuedDate: '2026-01-10',
    status: 'ACTIVE_WARRANT',
    summary: 'Flagged by MHA Police II Division for operating illegal cross-border counterfeit permit network.',
  },
  {
    id: 'WL-SLTD-2026-109',
    name: 'SARAH ELIZABETH JENKINS',
    aliases: ['Sarah Jenkins'],
    nationality: 'USA',
    dob: '1989-05-20',
    passportNum: '928104712',
    noticeType: 'INTERPOL_SLTD',
    category: 'Stolen and Lost Travel Documents (SLTD)',
    issuedDate: '2026-02-01',
    status: 'UNDER_SURVEILLANCE',
    summary: 'Document reported lost/stolen in transit; automated border interception required upon presentation.',
  },
];

export const WatchlistDatabaseView: React.FC = () => {
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>(INITIAL_WATCHLIST);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newEntry, setNewEntry] = useState<Partial<WatchlistEntry>>({
    noticeType: 'INTERPOL_RED_NOTICE',
    status: 'ACTIVE_WARRANT',
  });

  const filtered = watchlist.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.passportNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.aliases.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.name || !newEntry.passportNum) return;

    const created: WatchlistEntry = {
      id: `WL-NEW-${Date.now().toString().slice(-4)}`,
      name: newEntry.name.toUpperCase(),
      aliases: (newEntry.aliases as any) || [],
      nationality: newEntry.nationality?.toUpperCase() || 'UNKNOWN',
      dob: newEntry.dob || '1985-01-01',
      passportNum: newEntry.passportNum.toUpperCase(),
      noticeType: newEntry.noticeType || 'INTERPOL_RED_NOTICE',
      category: newEntry.category || 'Identity Fraud Suspect',
      issuedDate: new Date().toISOString().slice(0, 10),
      status: 'ACTIVE_WARRANT',
      summary: newEntry.summary || 'Added to national watch registry.',
    };

    setWatchlist([created, ...watchlist]);
    setShowAddModal(false);
    setNewEntry({ noticeType: 'INTERPOL_RED_NOTICE', status: 'ACTIVE_WARRANT' });
  };

  const handleDelete = (id: string) => {
    setWatchlist(watchlist.filter((w) => w.id !== id));
  };

  return (
    <div className="space-y-6 pb-12 text-slate-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#152238] pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Interpol &amp; National Watchlist
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Active Red Notices, Stolen &amp; Lost Travel Documents (SLTD), and SSB Fugitive Database.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#d4e4f7] hover:bg-white text-[#071326] font-bold text-xs uppercase tracking-wider rounded-md transition flex items-center gap-2 shadow-[0_0_15px_rgba(212,228,247,0.15)]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          REGISTER NEW ALERT
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#0b1424] border border-[#182740] rounded-xl p-4 shadow-lg flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search suspects by name, alias, passport number, or notice ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-sans"
        />
      </div>

      {/* Watchlist Suspect Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => {
          const isRedNotice = item.noticeType === 'INTERPOL_RED_NOTICE';
          const isBlacklist = item.noticeType === 'SSB_BLACKLIST';

          return (
            <div
              key={item.id}
              className={`bg-[#0b1424] border rounded-xl p-5 shadow-xl flex flex-col justify-between transition-all ${
                isRedNotice
                  ? 'border-[#882233] bg-[#0b1424]'
                  : isBlacklist
                  ? 'border-[#784d12] bg-[#0b1424]'
                  : 'border-[#182740]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span
                      className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded block w-fit mb-1.5 ${
                        isRedNotice
                          ? 'bg-[#3b1219] text-[#fca5a5] border border-[#882233]'
                          : isBlacklist
                          ? 'bg-[#291e11] text-[#fbbf24] border border-[#784d12]'
                          : 'bg-[#112419] text-[#6ee7b7]'
                      }`}
                    >
                      {item.noticeType.replace(/_/g, ' ')}
                    </span>
                    <h3 className="text-base font-bold text-white tracking-wide">{item.name}</h3>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-slate-500 hover:text-red-400 p-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5 text-xs font-mono mb-4 bg-[#070e1a] p-3 rounded-lg border border-[#15233a]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Passport / ID:</span>
                    <span className="font-bold text-white">{item.passportNum}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nationality:</span>
                    <span className="text-slate-200">{item.nationality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date of Birth:</span>
                    <span className="text-slate-200">{item.dob}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Known Aliases:</span>
                    <span className="text-cyan-300 font-sans text-[11px] truncate max-w-[140px]">
                      {item.aliases.join(', ')}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed mb-4">
                  {item.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-[#182740] flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Ref: {item.id}</span>
                <span className="text-red-400 font-bold flex items-center gap-1">
                  <AlertOctagon className="w-3 h-3" /> ACTIVE LEVEL-1
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Alert Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1424] border border-[#1e304f] rounded-xl p-5 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#182740] pb-3 mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Register National Security Watchlist Alert
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 text-xs font-sans">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Full Legal Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ARMAN KHAN"
                  value={newEntry.name || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                  className="w-full bg-[#070e1a] border border-[#182740] rounded-md p-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Passport / ID Number:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Z9920194"
                    value={newEntry.passportNum || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, passportNum: e.target.value })}
                    className="w-full bg-[#070e1a] border border-[#182740] rounded-md p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Nationality:</label>
                  <input
                    type="text"
                    placeholder="e.g. IND"
                    value={newEntry.nationality || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, nationality: e.target.value })}
                    className="w-full bg-[#070e1a] border border-[#182740] rounded-md p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Alert Classification:</label>
                <select
                  value={newEntry.noticeType}
                  onChange={(e: any) => setNewEntry({ ...newEntry, noticeType: e.target.value })}
                  className="w-full bg-[#070e1a] border border-[#182740] rounded-md p-2 text-white font-sans"
                >
                  <option value="INTERPOL_RED_NOTICE">INTERPOL RED NOTICE (Critical Arrest)</option>
                  <option value="SSB_BLACKLIST">SSB NATIONAL BLACKLIST (Border Intercept)</option>
                  <option value="INTERPOL_SLTD">INTERPOL SLTD (Stolen / Lost Document)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Summary of Offense / Directives:</label>
                <textarea
                  rows={3}
                  placeholder="Reason for warrant, intelligence details..."
                  value={newEntry.summary || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, summary: e.target.value })}
                  className="w-full bg-[#070e1a] border border-[#182740] rounded-md p-2 text-white font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#182740]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md font-bold"
                >
                  Save Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
