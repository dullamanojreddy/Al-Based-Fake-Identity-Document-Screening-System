import React, { useState } from 'react';
import { UserCheck, CheckCircle2, FileWarning, Lock, Save, MessageSquare, AlertCircle } from 'lucide-react';
import { ScreeningFinding, OfficerReviewRecord } from '../types';

interface OfficerReviewPanelProps {
  findings: ScreeningFinding[];
  existingReview?: OfficerReviewRecord;
  officerBadge: string;
  officerName: string;
  onSaveReview: (review: OfficerReviewRecord) => void;
}

export const OfficerReviewPanel: React.FC<OfficerReviewPanelProps> = ({
  findings = [],
  existingReview,
  officerBadge,
  officerName,
  onSaveReview,
}) => {
  const [confirmedIds, setConfirmedIds] = useState<string[]>(existingReview?.confirmedFindingIds || []);
  const [dismissedIds, setDismissedIds] = useState<string[]>(existingReview?.dismissedFindingIds || []);
  const [notes, setNotes] = useState<string>(existingReview?.officerNotes || '');
  const [secondaryRequested, setSecondaryRequested] = useState<boolean>(existingReview?.secondaryInspectionRequested || false);
  const [decision, setDecision] = useState<'CLEARED' | 'SECONDARY_INSPECTION' | 'DETAINED'>(
    existingReview?.finalDecision || 'SECONDARY_INSPECTION'
  );
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const toggleConfirm = (id: string) => {
    if (confirmedIds.includes(id)) {
      setConfirmedIds(confirmedIds.filter((i) => i !== id));
    } else {
      setConfirmedIds([...confirmedIds, id]);
      setDismissedIds(dismissedIds.filter((i) => i !== id));
    }
  };

  const toggleDismiss = (id: string) => {
    if (dismissedIds.includes(id)) {
      setDismissedIds(dismissedIds.filter((i) => i !== id));
    } else {
      setDismissedIds([...dismissedIds, id]);
      setConfirmedIds(confirmedIds.filter((i) => i !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const record: OfficerReviewRecord = {
      confirmedFindingIds: confirmedIds,
      dismissedFindingIds: dismissedIds,
      officerNotes: notes,
      secondaryInspectionRequested: secondaryRequested,
      finalDecision: decision,
      reviewedAt: new Date().toISOString(),
      officerBadge,
      officerName,
    };
    onSaveReview(record);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Human-in-the-Loop Officer Review
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          OFFICER: <strong className="text-white">{officerBadge}</strong>
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        {/* Finding Verification Checkboxes */}
        {findings.length > 0 && (
          <div>
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Verify Automated Findings:
            </span>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {findings.map((f) => {
                const isConfirmed = confirmedIds.includes(f.id);
                const isDismissed = dismissedIds.includes(f.id);
                return (
                  <div
                    key={f.id}
                    className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="truncate">
                      <span className="font-bold text-white block truncate">{f.title}</span>
                      <span className="text-[10px] text-slate-400 truncate block">{f.description}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleConfirm(f.id)}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                          isConfirmed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleDismiss(f.id)}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                          isDismissed
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Investigation Notes */}
        <div>
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
            Officer Observations &amp; Interrogation Notes:
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record traveler explanation, secondary booth findings, supervisor escalation notes..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Disposition Selector */}
        <div>
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
            Final Human Decision Disposition:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDecision('CLEARED')}
              className={`py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                decision === 'CLEARED'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Clear
            </button>
            <button
              type="button"
              onClick={() => setDecision('SECONDARY_INSPECTION')}
              className={`py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                decision === 'SECONDARY_INSPECTION'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-950'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              <FileWarning className="w-3.5 h-3.5" /> Secondary
            </button>
            <button
              type="button"
              onClick={() => setDecision('DETAINED')}
              className={`py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                decision === 'DETAINED'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Lock className="w-3.5 h-3.5" /> Detain
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2 flex items-center justify-between">
          {isSaved && (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Review Logged to Audit Trail
            </span>
          )}
          <button
            type="submit"
            className="ml-auto px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition flex items-center gap-2 shadow-lg shadow-cyan-950"
          >
            <Save className="w-3.5 h-3.5" /> Commit Officer Review
          </button>
        </div>
      </form>
    </div>
  );
};
