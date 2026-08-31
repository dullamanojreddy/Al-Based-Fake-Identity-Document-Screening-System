import React from 'react';
import { Cpu, CheckCircle2, ShieldCheck, Activity, Layers, FileCode } from 'lucide-react';
import { ModelRegistryEntry } from '../types';

const REGISTERED_MODELS: ModelRegistryEntry[] = [
  {
    id: 'MOD-001',
    modelName: 'SentinelVision-Multimodal-OCR',
    modelType: 'OCR_MULTIMODAL',
    version: 'v2.5.2',
    framework: 'Google Gemini 2.5 Flash Multimodal + Tesseract Fallback',
    weightsHash: 'sha256:7f89a2b1c9e450821d3f9e4b7a123c890123456789abcdef0123456789abcdef',
    thresholdConfig: { minConfidence: 0.85, deskewEnabled: true, orientationCorrection: true },
    active: true,
    datasetReference: 'Synthetic Passport & Visa VIZ Dataset v4',
    metrics: { accuracy: 99.4, f1Score: 0.991, avgLatencyMs: 380 },
  },
  {
    id: 'MOD-002',
    modelName: 'ICAO-9303-MRZ-Engine',
    modelType: 'MRZ_PARSER',
    version: 'v1.4.0',
    framework: 'Deterministic 7-3-1 Modulo-10 Checksum Algorithm',
    weightsHash: 'sha256:8899aabbccddeeff00112233445566778899aabbccddeeff0011223344556677',
    thresholdConfig: { formatsSupported: 'TD1, TD2, TD3, MRV-A, MRV-B', strictParity: true },
    active: true,
    datasetReference: 'ICAO Doc 9303 Part 3/4 Technical Specifications',
    metrics: { accuracy: 100.0, f1Score: 1.0, avgLatencyMs: 12 },
  },
  {
    id: 'MOD-003',
    modelName: 'DocTamper-Forensic-Segmentation',
    modelType: 'TAMPER_DETECTOR',
    version: 'v3.1.0',
    framework: 'HTML5 Canvas Error Level Analysis + ResNet-50 Feature Pyramid',
    weightsHash: 'sha256:3a4b5c6d7e8f901234567890abcdef1234567890abcdef1234567890abcdef12',
    thresholdConfig: { elaGain: 28, anomalyCutoff: 0.35, edgeDiscontinuityThreshold: 0.72 },
    active: true,
    datasetReference: 'DocTamper + Synthetic Photo Splicing Benchmark',
    metrics: { accuracy: 97.8, f1Score: 0.965, avgLatencyMs: 240 },
  },
  {
    id: 'MOD-004',
    modelName: 'ArcFace-Biometric-Verification',
    modelType: 'FACE_VERIFIER',
    version: 'v2.0.4',
    framework: 'InsightFace ArcFace (ResNet-100) + SCRFD Landmark Detector',
    weightsHash: 'sha256:a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
    thresholdConfig: { cosineMatchThreshold: 0.80, minLandmarks: 68, antiSpoofEnabled: true },
    active: true,
    datasetReference: 'LFW + Synthetic Passport Portrait Test Suite',
    metrics: { accuracy: 99.2, f1Score: 0.989, avgLatencyMs: 190 },
  },
  {
    id: 'MOD-005',
    modelName: 'Consular-Stamp-Integrity-Classifier',
    modelType: 'STAMP_ANALYZER',
    version: 'v1.2.1',
    framework: 'Fourier Frequency Analysis + Circular Edge Symmetry',
    weightsHash: 'sha256:99887766554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa',
    thresholdConfig: { symmetryThreshold: 0.70, inkBleedCutoff: 0.65 },
    active: true,
    datasetReference: 'Official Immigration Stamp Reference Database',
    metrics: { accuracy: 96.4, f1Score: 0.952, avgLatencyMs: 110 },
  },
];

export const ModelRegistryView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold uppercase tracking-wider text-white">
              AI Model Registry &amp; Forensic Reproducibility
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Auditable tracking of all active computer vision models, cryptographic weights hashes, and calibration thresholds
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" /> 5 Models Operational
        </span>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REGISTERED_MODELS.map((model) => (
          <div
            key={model.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-purple-400 block uppercase">
                    {model.modelType.replace(/_/g, ' ')}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{model.modelName}</h3>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-950 text-cyan-300 border border-slate-800 rounded">
                  {model.version}
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-3 font-sans">
                <strong className="text-slate-300">Framework:</strong> {model.framework}
              </p>

              {/* Cryptographic Hash */}
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 mb-3 text-[10px] font-mono">
                <span className="text-slate-500 block font-bold">Weights Hash (Forensic Verification):</span>
                <span className="text-slate-400 break-all select-all">{model.weightsHash}</span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono mb-3">
                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Accuracy</span>
                  <span className="text-emerald-400 font-bold">{model.metrics.accuracy}%</span>
                </div>
                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">F1 Score</span>
                  <span className="text-cyan-300 font-bold">{model.metrics.f1Score || 'N/A'}</span>
                </div>
                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Latency</span>
                  <span className="text-purple-300 font-bold">{model.metrics.avgLatencyMs}ms</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate max-w-[240px]">Ref: {model.datasetReference}</span>
              <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> ACTIVE
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
