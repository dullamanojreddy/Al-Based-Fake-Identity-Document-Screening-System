import React, { useState } from 'react';
import { 
  Settings, 
  Sliders, 
  Cpu, 
  ShieldCheck, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  SlidersHorizontal,
  Layers,
  Sparkles
} from 'lucide-react';

export const SystemSettingsView: React.FC = () => {
  const [elaGain, setElaGain] = useState<number>(28);
  const [biometricCutoff, setBiometricCutoff] = useState<number>(80);
  const [tamperSensitivity, setTamperSensitivity] = useState<number>(75);
  const [ocrDeskew, setOcrDeskew] = useState<boolean>(true);
  const [antiSpoofingMode, setAntiSpoofingMode] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    setElaGain(28);
    setBiometricCutoff(80);
    setTamperSensitivity(75);
    setOcrDeskew(true);
    setAntiSpoofingMode(true);
  };

  return (
    <div className="space-y-6 pb-12 text-slate-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#152238] pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Diagnostic &amp; Algorithm Settings
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Calibrate forensic computer vision thresholds, ELA compression multipliers, and biometric confidence cutoffs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 bg-[#0e192c] hover:bg-[#182a47] text-slate-300 border border-[#1b2b46] rounded-md text-xs font-mono font-bold uppercase transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESET FACTORY DEFAULTS
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5 max-w-4xl">
        {/* Card 1: Forensic Computer Vision Thresholds */}
        <div className="bg-[#0b1424] border border-[#182740] rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-[#182740] pb-3">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Forensic Image Analysis &amp; ELA Configuration
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* ELA Gain Multiplier */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300 font-bold">Error Level Analysis (ELA) Gain:</span>
                <span className="text-cyan-400 font-bold">{elaGain}x</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={elaGain}
                onChange={(e) => setElaGain(Number(e.target.value))}
                className="w-full h-1.5 bg-[#15233a] rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Amplifies JPEG compression error residuals to isolate cut-and-paste splicing boundaries.
              </p>
            </div>

            {/* Tamper Sensitivity */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300 font-bold">Tamper Anomaly Cutoff:</span>
                <span className="text-[#f59e0b] font-bold">{tamperSensitivity}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={tamperSensitivity}
                onChange={(e) => setTamperSensitivity(Number(e.target.value))}
                className="w-full h-1.5 bg-[#15233a] rounded-lg appearance-none cursor-pointer accent-[#f59e0b]"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Threshold for triggering automated secondary inspection flags upon localized pixel variance.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Biometric Facial Matching */}
        <div className="bg-[#0b1424] border border-[#182740] rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-[#182740] pb-3">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              1:1 Facial Biometric Verification Calibration
            </h3>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-300 font-bold">Minimum Face Match Cosine Similarity:</span>
              <span className="text-emerald-400 font-bold">{biometricCutoff}%</span>
            </div>
            <input
              type="range"
              min="60"
              max="95"
              value={biometricCutoff}
              onChange={(e) => setBiometricCutoff(Number(e.target.value))}
              className="w-full h-1.5 bg-[#15233a] rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Required 68-landmark cosine similarity score to clear passenger through automated e-Gate.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess && (
            <span className="text-emerald-400 font-mono text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> Threshold Configurations Successfully Deployed
            </span>
          )}
          <button
            type="submit"
            className="ml-auto px-5 py-2.5 bg-[#d4e4f7] hover:bg-white text-[#071326] rounded-md font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 shadow"
          >
            <Save className="w-4 h-4" />
            SAVE &amp; APPLY CONFIGURATION
          </button>
        </div>
      </form>
    </div>
  );
};
