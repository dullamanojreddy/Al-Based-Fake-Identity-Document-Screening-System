import React from 'react';
import { FileText, CheckCircle2, AlertTriangle, Sparkles, HelpCircle } from 'lucide-react';
import { DocumentField } from '../types';

interface ExtractedFieldsTableProps {
  fields: DocumentField[];
}

export const ExtractedFieldsTable: React.FC<ExtractedFieldsTableProps> = ({ fields }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Module 1: OCR Extracted Fields &amp; Confidence
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
          {fields.length} FIELDS PARSED
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Field Name</th>
              <th className="py-2.5 px-3">Extracted Value</th>
              <th className="py-2.5 px-3 text-center">AI Confidence</th>
              <th className="py-2.5 px-3 text-right">Integrity Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
            {fields.map((field) => (
              <tr key={field.key} className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-semibold text-slate-300">
                  {field.label}
                </td>
                <td className="py-2.5 px-3 font-mono font-bold text-white select-all">
                  {field.value}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <div className="inline-flex items-center gap-1.5 font-mono text-xs">
                    <span className="text-emerald-400 font-bold">{field.confidence}%</span>
                    <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${field.confidence}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-right">
                  {field.isTampered ? (
                    <span className="text-red-400 font-bold font-mono text-[11px] inline-flex items-center gap-1 bg-red-950/80 border border-red-800 px-2 py-0.5 rounded">
                      <AlertTriangle className="w-3 h-3 text-red-400" /> ANOMALY
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-bold font-mono text-[11px] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
