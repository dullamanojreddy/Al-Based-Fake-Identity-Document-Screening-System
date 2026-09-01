export type WatchlistNoticeType = 'INTERPOL_RED_NOTICE' | 'INTERPOL_SLTD' | 'SSB_BLACKLIST' | 'FRAUD_SUSPECT' | 'ENHANCED_REVIEW';
export type WatchlistEntryStatus = 'ACTIVE_WARRANT' | 'UNDER_SURVEILLANCE' | 'DETAINED' | 'PENDING_REVIEW';

export interface WatchlistEntry {
  id: string; name: string; aliases: string[]; nationality: string; dob: string; passportNum: string;
  noticeType: WatchlistNoticeType; category: string; issuedDate: string; status: WatchlistEntryStatus; summary: string;
  sourceCaseId?: string; riskScore?: number;
}

export const INITIAL_WATCHLIST: WatchlistEntry[] = [
  { id: 'WL-INT-2025-001', name: 'VLADIMIR IVANOV', aliases: ['Maximilian Weber','Klaus Weber','V. Groznyi'], nationality: 'AUT / RUS', dob: '1981-05-19', passportNum: 'A77192083', noticeType: 'INTERPOL_RED_NOTICE', category: 'Transnational Syndicate Fraud & Identity Laundering', issuedDate: '2025-08-14', status: 'ACTIVE_WARRANT', summary: 'Wanted by Austrian Federal Criminal Police & Europol for forging 40+ diplomatic travel passports.' },
  { id: 'WL-SSB-2026-042', name: 'TARIQ AHMED MIRZA', aliases: ['T. A. Mirza','Ahmed Khan'], nationality: 'PAK', dob: '1979-11-03', passportNum: 'PA8829104', noticeType: 'SSB_BLACKLIST', category: 'Cross-Border Smuggling & Counterfeit Visa Distribution', issuedDate: '2026-01-10', status: 'ACTIVE_WARRANT', summary: 'Flagged by MHA Police II Division for operating illegal cross-border counterfeit permit network.' },
  { id: 'WL-SLTD-2026-109', name: 'SARAH ELIZABETH JENKINS', aliases: ['Sarah Jenkins'], nationality: 'USA', dob: '1989-05-20', passportNum: '928104712', noticeType: 'INTERPOL_SLTD', category: 'Stolen and Lost Travel Documents (SLTD)', issuedDate: '2026-02-01', status: 'UNDER_SURVEILLANCE', summary: 'Document reported lost/stolen in transit; automated border interception required.' },
];
