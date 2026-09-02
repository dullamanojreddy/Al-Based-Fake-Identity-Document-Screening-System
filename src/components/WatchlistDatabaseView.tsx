import React, { useState } from 'react';
import { Search, Plus, Trash2, AlertOctagon, Filter, ChevronDown } from 'lucide-react';
import { WatchlistEntry } from '../data/watchlistEntries';

interface WatchlistDatabaseViewProps {
  watchlist: WatchlistEntry[];
  onUpdateWatchlist: React.Dispatch<React.SetStateAction<WatchlistEntry[]>>;
}

export const WatchlistDatabaseView: React.FC<WatchlistDatabaseViewProps> = ({ watchlist, onUpdateWatchlist }) => {
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
      item.aliases.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.name || !newEntry.passportNum) return;

    const created: WatchlistEntry = {
      id: `WL-NEW-${Date.now().toString().slice(-4)}`,
      name: newEntry.name.toUpperCase(),
      aliases: (newEntry.aliases as any) || [],
      nationality: newEntry.nationality?.toUpperCase() || 'UNKNOWN',
      dob: newEntry.dob || 'UNKNOWN',
      passportNum: newEntry.passportNum.toUpperCase(),
      noticeType: newEntry.noticeType || 'INTERPOL_RED_NOTICE',
      category: newEntry.category || 'Identity Fraud Suspect',
      issuedDate: new Date().toISOString().slice(0, 10),
      status: newEntry.status || 'PENDING_REVIEW',
      summary: newEntry.summary || 'Manual watchlist record.',
    };

    onUpdateWatchlist((entries) => [created, ...entries]);
    setShowAddModal(false);
    setNewEntry({ noticeType: 'INTERPOL_RED_NOTICE', status: 'ACTIVE_WARRANT' });
  };

  const handleDelete = (id: string) => {
    onUpdateWatchlist((entries) => entries.filter((w) => w.id !== id));
  };

  return (
    <div className="space-y-5 pb-12 text-slate-800">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Watchlist Records</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active Interpol Red Notices, SLTD records, and National Fugitive Database.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-md transition flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Record
        </button>
      </div>

      {/* Database Container */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="relative w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, alias, ID, or notice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-md text-xs text-slate-600 bg-white hover:bg-slate-50 transition-colors">
              <Filter className="w-3.5 h-3.5" />
              Filter <ChevronDown className="w-3.5 h-3.5 opacity-50" />
            </button>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {filtered.length} active records
          </span>
        </div>

        {/* Watchlist Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-medium">Record ID</th>
                <th className="py-2.5 px-4 font-medium">Name & Aliases</th>
                <th className="py-2.5 px-4 font-medium">Document Info</th>
                <th className="py-2.5 px-4 font-medium">Source / Notice Type</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    No watchlist records found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isRedNotice = item.noticeType === 'INTERPOL_RED_NOTICE';
                  const isBlacklist = item.noticeType === 'SSB_BLACKLIST';
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition group">
                      <td className="py-3 px-4 align-top">
                        <span className="font-mono text-slate-500 text-[11px]">{item.id}</span>
                        <div className="text-[10px] text-slate-400 mt-1">Added: {item.issuedDate}</div>
                      </td>
                      <td className="py-3 px-4 align-top">
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        {item.aliases.length > 0 && (
                          <div className="text-[10px] text-slate-500 mt-0.5 max-w-[200px] truncate" title={item.aliases.join(', ')}>
                            AKA: {item.aliases.join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 align-top">
                        <div className="font-mono text-slate-700">{item.passportNum}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {item.nationality} • DOB: {item.dob}
                        </div>
                      </td>
                      <td className="py-3 px-4 align-top">
                        <div className="font-medium text-slate-700 text-[11px]">
                          {item.noticeType.replace(/_/g, ' ')}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 max-w-[220px] truncate" title={item.summary}>
                          {item.category}
                        </div>
                      </td>
                      <td className="py-3 px-4 align-top">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          isRedNotice ? 'bg-red-50 text-red-700 border border-red-100' :
                          isBlacklist ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 align-top text-right">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition opacity-0 group-hover:opacity-100"
                          title="Remove Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Alert Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-lg p-5 max-w-lg w-full shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Register New Watchlist Record
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 font-medium block mb-1.5">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ARMAN KHAN"
                  value={newEntry.name || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 font-sans focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 font-medium block mb-1.5">Passport / ID Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Z9920194"
                    value={newEntry.passportNum || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, passportNum: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1.5">Nationality</label>
                  <input
                    type="text"
                    placeholder="e.g. IND"
                    value={newEntry.nationality || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, nationality: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1.5">Alert Source / Type</label>
                <select
                  value={newEntry.noticeType}
                  onChange={(e: any) => setNewEntry({ ...newEntry, noticeType: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 font-sans focus:outline-none focus:border-blue-500"
                >
                  <option value="INTERPOL_RED_NOTICE">INTERPOL RED NOTICE (Critical Arrest)</option>
                  <option value="SSB_BLACKLIST">SSB NATIONAL BLACKLIST (Border Intercept)</option>
                  <option value="INTERPOL_SLTD">INTERPOL SLTD (Stolen / Lost Document)</option>
                  <option value="FRAUD_SUSPECT">FRAUD SUSPECT (Surveillance)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1.5">Summary of Record / Directives</label>
                <textarea
                  rows={3}
                  placeholder="Reason for warrant, intelligence details..."
                  value={newEntry.summary || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, summary: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 font-sans focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium shadow-sm"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
