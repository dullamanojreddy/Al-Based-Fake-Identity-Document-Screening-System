import React, { useState } from 'react';
import { 
  Scan, 
  Image as ImageIcon, 
  Type, 
  Stamp, 
  FileCode, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Cpu,
  Flame
} from 'lucide-react';
import { TamperingForensics } from '../types';

interface TamperDetectionCardProps {
  tampering: TamperingForensics;
}

type TabType = 'photo' | 'text' | 'stamp' | 'metadata';

export const TamperDetectionCard: React.FC<TamperDetectionCardProps> = ({ tampering }) => {
  const [activeTab, setActiveTab] = useState<TabType>('photo');

  const { overallTamperScore, isTampered, photoReplacement, textManipulation, stampForgery, metadataAnalysis } = tampering;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Module 3: AI Document Tampering Forensics
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400">
            COMPOSITE TAMPER INDEX:
          </span>
          <span
            className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
              overallTamperScore > 40
                ? 'bg-red-950 text-red-400 border border-red-800'
                : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
            }`}
          >
            {overallTamperScore}% {isTampered ? 'ANOMALY DETECTED' : 'CLEAN'}
          </span>
        </div>
      </div>

      {/* Forensic Tabs */}
      <div className="flex border-b border-slate-800 mb-4 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('photo')}
          className={`px-3 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'photo'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Photo Splicing &amp; ELA
          {photoReplacement.detected && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('text')}
          className={`px-3 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'text'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          Font &amp; Text Modification
          {textManipulation.detected && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('stamp')}
          className={`px-3 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'stamp'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Stamp className="w-3.5 h-3.5" />
          Stamp &amp; Seal Forgery
          {stampForgery.detected && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('metadata')}
          className={`px-3 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'metadata'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          EXIF &amp; Software Traces
          {metadataAnalysis.editingSoftwareFound && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          )}
        </button>
      </div>

      {/* Tab 1: Photo Replacement */}
      {activeTab === 'photo' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                ELA Anomaly Discrepancy
              </span>
              <span className={`text-lg font-mono font-bold ${photoReplacement.elaAnomalyScore > 30 ? 'text-red-400' : 'text-emerald-400'}`}>
                {photoReplacement.elaAnomalyScore}%
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">JPEG Compression Diff</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                Splicing Boundary Edge
              </span>
              <span className={`text-lg font-mono font-bold ${photoReplacement.splicingEdgeDetected ? 'text-red-400' : 'text-emerald-400'}`}>
                {photoReplacement.splicingEdgeDetected ? 'SPLICED EDGE' : 'SEAMLESS'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Gradient Discontinuity</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                Lighting / Noise Disparity
              </span>
              <span className={`text-lg font-mono font-bold ${photoReplacement.lightingInconsistency ? 'text-amber-400' : 'text-emerald-400'}`}>
                {photoReplacement.lightingInconsistency ? 'MISMATCHED' : 'UNIFORM'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Vector Illumination</span>
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border ${photoReplacement.detected ? 'bg-red-950/40 border-red-800/80 text-red-200' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1">
              {photoReplacement.detected ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400">Photo Replacement Anomaly Located</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Portrait Photo Verified Authentic</span>
                </>
              )}
            </div>
            <p className="text-xs leading-relaxed">{photoReplacement.details}</p>
          </div>
        </div>
      )}

      {/* Tab 2: Text Manipulation */}
      {activeTab === 'text' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                Font Morphology Uniformity
              </span>
              <span className={`text-lg font-mono font-bold ${textManipulation.fontInconsistency ? 'text-red-400' : 'text-emerald-400'}`}>
                {textManipulation.fontInconsistency ? 'MISALIGNED' : 'COMPLIANT'}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                Baseline Offset Variance
              </span>
              <span className={`text-lg font-mono font-bold ${textManipulation.baselineMisalignment ? 'text-red-400' : 'text-emerald-400'}`}>
                {textManipulation.baselineMisalignment ? 'SHIFT DETECTED' : 'PERFECT (0px)'}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                Copy-Paste Artifacts
              </span>
              <span className={`text-lg font-mono font-bold ${textManipulation.digitalCopyPasteArtifacts ? 'text-red-400' : 'text-emerald-400'}`}>
                {textManipulation.digitalCopyPasteArtifacts ? 'DETECTED' : 'CLEAN'}
              </span>
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border ${textManipulation.detected ? 'bg-red-950/40 border-red-800/80 text-red-200' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1">
              {textManipulation.detected ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400">Printed Text Manipulation Flagged</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Typography Conforms to National Standards</span>
                </>
              )}
            </div>
            <p className="text-xs leading-relaxed">{textManipulation.details}</p>
          </div>
        </div>
      )}

      {/* Tab 3: Stamp & Seal Forgery */}
      {activeTab === 'stamp' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                Circular Edge Symmetry
              </span>
              <span className={`text-lg font-mono font-bold ${stampForgery.circularEdgeIntegrity < 70 ? 'text-red-400' : 'text-emerald-400'}`}>
                {stampForgery.circularEdgeIntegrity}%
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                Paper Ink Bleed Absorption
              </span>
              <span className={`text-lg font-mono font-bold ${stampForgery.inkBleedAnomaly ? 'text-red-400' : 'text-emerald-400'}`}>
                {stampForgery.inkBleedAnomaly ? 'SYNTHETIC / NO BLEED' : 'NATURAL INK'}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                Cloned Seal Template Match
              </span>
              <span className={`text-lg font-mono font-bold ${stampForgery.clonedSealDetected ? 'text-red-400' : 'text-emerald-400'}`}>
                {stampForgery.clonedSealDetected ? 'CLONED MATCH' : 'ORIGINAL'}
              </span>
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border ${stampForgery.detected ? 'bg-red-950/40 border-red-800/80 text-red-200' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1">
              {stampForgery.detected ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400">Forged / Cloned Stamp Detected</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Official Embossed Seal Verified</span>
                </>
              )}
            </div>
            <p className="text-xs leading-relaxed">{stampForgery.details}</p>
          </div>
        </div>
      )}

      {/* Tab 4: Metadata & EXIF */}
      {activeTab === 'metadata' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Detected Editing Software Signatures &amp; Headers:
            </span>
            {metadataAnalysis.softwareTraces.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {metadataAnalysis.softwareTraces.map((soft, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-red-950 text-red-300 border border-red-800 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    {soft}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                No photo-editing software headers detected. Clean raw camera/scanner profile.
              </span>
            )}
          </div>

          <div className={`p-3.5 rounded-xl border ${metadataAnalysis.editingSoftwareFound ? 'bg-red-950/40 border-red-800/80 text-red-200' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1">
              <span className="text-xs font-bold uppercase">Digital File Exif Diagnostics:</span>
            </div>
            <p className="text-xs leading-relaxed">{metadataAnalysis.details}</p>
          </div>
        </div>
      )}
    </div>
  );
};
