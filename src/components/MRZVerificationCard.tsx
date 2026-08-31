import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Hash, FileCheck, ShieldAlert } from 'lucide-react';
import { MRZData } from '../types';

interface MRZVerificationCardProps {
  mrzData?: MRZData;
}

export const MRZVerificationCard: React.FC<MRZVerificationCardProps> = ({ mrzData }) => {
  if (!mrzData) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center text-slate-400">
        <Hash className="w-8 h-8 mx-auto mb-2 text-slate-600" />
        <p className="text-sm">No ICAO 9303 Machine Readable Zone detected on this document type.</p>
      </div>
    );
  }

  const {
    rawLines,
    format,
    countryCode,
    documentNumber,
    nationality,
    birthDateFormatted,
    expirationDateFormatted,
    sex,
    isAllChecksumsValid,
    checksumList,
    vizMismatchDetected,
    vizMismatchDetails,
  } = mrzData;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            ICAO Doc 9303 MRZ Engine &amp; Checksums
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded">
            FORMAT: {format} (7-3-1 Weight)
          </span>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
              isAllChecksumsValid
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-red-950 text-red-400 border border-red-800'
            }`}
          >
            {isAllChecksumsValid ? (
              <>
                <CheckCircle2 className="w-3 h-3" /> CHECKSUMS VALID
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3" /> CHECKSUM FAILED
              </>
            )}
          </span>
        </div>
      </div>

      {/* Raw MRZ Stream with Optical Highlighting */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 mb-4 overflow-x-auto">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Decoded Optical Character Stream (ICAO OCR-B):
        </span>
        <div className="space-y-1 font-mono text-sm sm:text-base font-bold tracking-[0.18em] text-cyan-300 select-all">
          {rawLines.map((line, idx) => (
            <div key={idx} className="bg-slate-900/90 px-3 py-1.5 rounded border border-slate-800/80">
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* Decoded Field Summary Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-semibold text-slate-400 block uppercase">Issuing State</span>
          <span className="text-sm font-bold font-mono text-white">{countryCode}</span>
        </div>
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-semibold text-slate-400 block uppercase">Doc Number</span>
          <span className="text-sm font-bold font-mono text-cyan-300">{documentNumber}</span>
        </div>
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-semibold text-slate-400 block uppercase">Decoded DOB</span>
          <span className="text-sm font-bold font-mono text-white">{birthDateFormatted}</span>
        </div>
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-semibold text-slate-400 block uppercase">Decoded Expiry</span>
          <span className="text-sm font-bold font-mono text-white">{expirationDateFormatted}</span>
        </div>
      </div>

      {/* Mathematical 7-3-1 Modulo-10 Checksum Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 mb-3">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
            <tr>
              <th className="py-2 px-3">Field Validated</th>
              <th className="py-2 px-3">Extracted Hash</th>
              <th className="py-2 px-3">Printed CD</th>
              <th className="py-2 px-3">Computed CD</th>
              <th className="py-2 px-3 text-right">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/50 font-mono text-[11px]">
            {checksumList.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30">
                <td className="py-2 px-3 font-sans text-slate-200 font-medium">{item.field}</td>
                <td className="py-2 px-3 text-slate-400">{item.extractedValue}</td>
                <td className="py-2 px-3 text-cyan-300 font-bold">{item.checkDigit}</td>
                <td className="py-2 px-3 text-purple-300 font-bold">{item.computedCheckDigit}</td>
                <td className="py-2 px-3 text-right">
                  {item.isValid ? (
                    <span className="text-emerald-400 font-bold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> MATCH
                    </span>
                  ) : (
                    <span className="text-red-400 font-bold inline-flex items-center gap-1 animate-pulse">
                      <XCircle className="w-3.5 h-3.5" /> CHECKSUM FAIL
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VIZ (Visual Inspection Zone) Mismatch Banner */}
      {vizMismatchDetected && (
        <div className="bg-red-950/60 border border-red-700/80 rounded-xl p-3.5 animate-in fade-in">
          <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider mb-1.5">
            <ShieldAlert className="w-4 h-4" />
            CRITICAL: Visual Inspection Zone (VIZ) &amp; MRZ Mismatch!
          </div>
          <ul className="space-y-1 text-xs text-red-200 font-sans">
            {vizMismatchDetails.map((detail, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-red-400 font-bold">⚠</span>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
