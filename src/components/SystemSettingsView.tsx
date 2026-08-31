import React, { useState } from 'react';
import { Sliders, Cpu, Camera, ShieldCheck, CheckCircle2, RefreshCw, Save } from 'lucide-react';

export const SystemSettingsView: React.FC = () => {
  const [elaGain, setElaGain] = useState<number>(28);
  const [bioMatchThreshold, setBioMatchThreshold] = useState<number>(80);
  const [ocrEngine, setOcrEngine] = useState<string>('GEMINI_2_5_FLASH');
  const [autoDetainThreshold, setAutoDetainThreshold] = useState<number>(65);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold uppercase tracking-wider text-white">
              System Configuration &amp; Hardware Diagnostics
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure AI forensic algorithms, biometric thresholds, and checkpoint hardware parameters
          </p>
        </div>

        {isSaved && (
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" /> Parameters Updated
          </span>
        )}
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 3: Tamper Forensics Parameters */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Forensic Algorithm Thresholds
            </h3>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-300">ELA Amplification Gain</span>
              <span className="text-purple-400 font-bold">{elaGain}x</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              value={elaGain}
              onChange={(e) => setElaGain(parseInt(e.target.value, 10))}
              className="w-full accent-purple-500"
            />
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Controls JPEG compression difference scaling factor for detecting photo splicing.
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-300">High-Alert Detain Threshold</span>
              <span className="text-red-400 font-bold">{autoDetainThreshold} / 100</span>
            </div>
            <input
              type="range"
              min="50"
              max="90"
              value={autoDetainThreshold}
              onChange={(e) => setAutoDetainThreshold(parseInt(e.target.value, 10))}
              className="w-full accent-red-500"
            />
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Composite risk score cutoff that automatically triggers level-1 detention alarm.
            </span>
          </div>
        </div>

        {/* Module 4: Biometrics & Hardware */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Camera className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Biometrics &amp; AI Vision Model
            </h3>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-300">Facial Similarity Pass Criteria</span>
              <span className="text-cyan-400 font-bold">{bioMatchThreshold}%</span>
            </div>
            <input
              type="range"
              min="60"
              max="95"
              value={bioMatchThreshold}
              onChange={(e) => setBioMatchThreshold(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-500"
            />
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Minimum cosine similarity between document portrait and live passenger camera.
            </span>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-300 block mb-1">Active AI Multimodal Vision Pipeline</label>
            <select
              value={ocrEngine}
              onChange={(e) => setOcrEngine(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="GEMINI_2_5_FLASH">Google Gemini 2.5 Flash Multimodal (Cloud / High Speed)</option>
              <option value="TESSERACT_CLIENT">Tesseract.js Local Client Engine (Offline Safe)</option>
              <option value="HYBRID_SSB">Hybrid Vision + ICAO 9303 Dual-Verification Pipeline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-cyan-950"
        >
          <Save className="w-4 h-4" />
          Save System Configuration
        </button>
      </div>
    </div>
  );
};
