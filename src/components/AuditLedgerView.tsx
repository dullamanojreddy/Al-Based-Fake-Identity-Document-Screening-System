import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  LogOut, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  LogIn,
  SlidersHorizontal,
  XCircle,
  Clock
} from 'lucide-react';

interface AuditEvent {
  seq: string;
  timestamp: string;
  eventType: string;
  eventDetails: string;
  iconType: 'login' | 'screening' | 'override' | 'completed';
  officer: string;
  hash: string;
  isTampered: boolean;
}

const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  {
    seq: '01',
    timestamp: '2023-10-27T14:30:15.221Z',
    eventType: 'System Login',
    eventDetails: 'Terminal Term-Alpha-9',
    iconType: 'login',
    officer: 'OFC-7782 (J. Doe)',
    hash: '8f4e3b...a1c9',
    isTampered: false,
  },
  {
    seq: '02',
    timestamp: '2023-10-27T14:35:42.105Z',
    eventType: 'Screening Initiated',
    eventDetails: 'Subject ID: 994-XQ',
    iconType: 'screening',
    officer: 'OFC-7782 (J. Doe)',
    hash: 'd2e9f1...7b4c',
    isTampered: false,
  },
  {
    seq: '03',
    timestamp: '2023-10-27T14:41:19.882Z',
    eventType: 'Watchlist Override',
    eventDetails: 'Manual Removal - Unauthorized',
    iconType: 'override',
    officer: 'SYS-ADMIN-1',
    hash: 'e5a2b8...9e1f',
    isTampered: true,
  },
  {
    seq: '04',
    timestamp: '2023-10-27T14:45:03.441Z',
    eventType: 'Screening Completed',
    eventDetails: 'Result: Clear',
    iconType: 'completed',
    officer: 'OFC-7782 (J. Doe)',
    hash: 'e7f4a2...b1d9',
    isTampered: false,
  },
];

export const AuditLedgerView: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>(INITIAL_AUDIT_EVENTS);
  const [filterTab, setFilterTab] = useState<'ALL' | 'SCREENINGS' | 'WATCHLIST'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isVerifiedSuccess, setIsVerifiedSuccess] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerifiedSuccess(true);
      setTimeout(() => setIsVerifiedSuccess(false), 3000);
    }, 400);
  };

  const handleToggleTamper = () => {
    setEvents((prev) =>
      prev.map((e) =>
        e.seq === '03' ? { ...e, isTampered: !e.isTampered } : e
      )
    );
  };

  const filteredEvents = events.filter((e) => {
    const matchSearch =
      e.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.eventDetails.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.officer.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterTab === 'SCREENINGS') return matchSearch && (e.iconType === 'screening' || e.iconType === 'completed');
    if (filterTab === 'WATCHLIST') return matchSearch && e.iconType === 'override';
    return matchSearch;
  });

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      {/* Top Header matching Stitch Screenshot 2 */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight font-sans">
            Cryptographic Audit Chain
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Immutable chronological record of system events. All entries are cryptographically hashed to ensure absolute data integrity.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleToggleTamper}
            className="px-3 py-2 bg-white hover:bg-[#1a2c4d] text-slate-600 border border-slate-200 text-xs font-mono font-bold uppercase rounded-md transition"
          >
            {events.some((e) => e.isTampered) ? 'Fix Tampered Block' : 'Simulate Hash Break'}
          </button>

          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="px-4 py-2 bg-[#d4e4f7] hover:bg-white text-[#071326] font-bold text-xs uppercase tracking-wider rounded-md transition flex items-center gap-2 shadow-[0_0_15px_rgba(212,228,247,0.15)]"
          >
            <ShieldCheck className={`w-4 h-4 stroke-[2.5] ${isVerifying ? 'animate-spin' : ''}`} />
            VERIFY CHAIN INTEGRITY
          </button>
        </div>
      </div>

      {/* Filter Toolbar & Last Verification Timestamp */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Hash or Event ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-400 font-sans"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-md border border-slate-200">
            <button
              onClick={() => setFilterTab('ALL')}
              className={`px-3 py-1 text-[11px] font-mono font-bold uppercase rounded transition ${
                filterTab === 'ALL'
                  ? 'bg-blue-50 text-slate-900 shadow'
                  : 'text-slate-400 hover:text-slate-800'
              }`}
            >
              ALL EVENTS
            </button>
            <button
              onClick={() => setFilterTab('SCREENINGS')}
              className={`px-3 py-1 text-[11px] font-mono font-bold uppercase rounded transition ${
                filterTab === 'SCREENINGS'
                  ? 'bg-blue-50 text-slate-900 shadow'
                  : 'text-slate-400 hover:text-slate-800'
              }`}
            >
              SCREENINGS
            </button>
            <button
              onClick={() => setFilterTab('WATCHLIST')}
              className={`px-3 py-1 text-[11px] font-mono font-bold uppercase rounded transition ${
                filterTab === 'WATCHLIST'
                  ? 'bg-blue-50 text-slate-900 shadow'
                  : 'text-slate-400 hover:text-slate-800'
              }`}
            >
              WATCHLIST
            </button>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
          <span>Last Verification:</span>
          <span className="text-slate-800 font-bold">2023-10-27T14:32:01Z</span>
        </div>
      </div>

      {/* Audit Ledger Table matching Screenshot 2 */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">EVENT TIMESTAMP (UTC)</th>
                <th className="py-3 px-4">EVENT TYPE &amp; DETAILS</th>
                <th className="py-3 px-4">OFFICER / SYSTEM</th>
                <th className="py-3 px-4">CRYPTOGRAPHIC HASH</th>
                <th className="py-3 px-4 text-right">INTEGRITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
              {filteredEvents.map((evt) => {
                const isTampered = evt.isTampered;

                return (
                  <tr
                    key={evt.seq}
                    className={`transition-colors ${
                      isTampered
                        ? 'bg-red-50/80 text-red-700 hover:bg-[#38131b]'
                        : 'hover:bg-[#101b2f] text-slate-600'
                    }`}
                  >
                    {/* Seq */}
                    <td className={`py-3.5 px-4 font-bold ${isTampered ? 'text-red-700' : 'text-slate-400'}`}>
                      {evt.seq}
                    </td>

                    {/* Timestamp */}
                    <td className={`py-3.5 px-4 ${isTampered ? 'text-red-700 font-bold' : 'text-slate-600'}`}>
                      {evt.timestamp}
                    </td>

                    {/* Event Type & Details */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        {evt.iconType === 'login' && <LogIn className="w-4 h-4 text-blue-600 shrink-0" />}
                        {evt.iconType === 'screening' && <FileText className="w-4 h-4 text-blue-600 shrink-0" />}
                        {evt.iconType === 'override' && <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />}
                        {evt.iconType === 'completed' && <FileText className="w-4 h-4 text-blue-600 shrink-0" />}

                        <div>
                          <span className={`font-bold block font-sans ${isTampered ? 'text-red-700' : 'text-slate-900'}`}>
                            {evt.eventType}
                          </span>
                          <span className={`text-[10px] block font-mono ${isTampered ? 'text-red-700' : 'text-slate-400'}`}>
                            {evt.eventDetails}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Officer / System */}
                    <td className={`py-3.5 px-4 ${isTampered ? 'text-red-700 font-bold' : 'text-slate-600'}`}>
                      {evt.officer}
                    </td>

                    {/* Cryptographic Hash */}
                    <td className={`py-3.5 px-4 font-mono select-all ${isTampered ? 'text-red-700 line-through' : 'text-slate-400'}`}>
                      {evt.hash}
                    </td>

                    {/* Integrity Badge */}
                    <td className="py-3.5 px-4 text-right">
                      {isTampered ? (
                        <span className="px-2.5 py-1 rounded bg-[#dc2626] text-slate-900 text-[10px] font-mono font-bold uppercase inline-flex items-center gap-1.5 shadow-[0_0_12px_rgba(220,38,38,0.4)]">
                          <XCircle className="w-3 h-3" />
                          CHAIN BROKEN
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-[#0e271d] text-emerald-700 border border-[#1e5238] text-[10px] font-mono font-bold uppercase inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          VERIFIED
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Showing 1-4 of 1,249 Events</span>

          <div className="flex items-center gap-2">
            <button className="p-1 rounded bg-slate-50 border border-slate-200 hover:text-slate-900 transition">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 rounded bg-slate-50 border border-slate-200 hover:text-slate-900 transition">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
