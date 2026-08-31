import React, { useState } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  SlidersHorizontal,
  Clock,
  Plus,
  Edit2,
  FileCheck2,
  Lock,
  Cpu,
  Fingerprint
} from 'lucide-react';

interface RegionalRule {
  id: string;
  regionCode: string;
  documentType: string;
  securityFeatures: string[];
  status: 'Active' | 'Deprecated';
}

export const SystemSettingsView: React.FC = () => {
  const [faceSimilarity, setFaceSimilarity] = useState<number>(85.0);
  const [ocrConfidence, setOcrConfidence] = useState<number>(92.5);
  const [strictJwt, setStrictJwt] = useState<boolean>(true);
  const [verboseAudit, setVerboseAudit] = useState<boolean>(false);
  const [sessionTimeout, setSessionTimeout] = useState<number>(15);

  const [regionalRules, setRegionalRules] = useState<RegionalRule[]>([
    {
      id: 'r1',
      regionCode: 'ISO-3166:US',
      documentType: 'e-Passport (MRZ)',
      securityFeatures: ['UV Watermark', 'RFID Chip'],
      status: 'Active',
    },
    {
      id: 'r2',
      regionCode: 'ISO-3166:GB',
      documentType: 'National ID Card',
      securityFeatures: ['Hologram', 'Microprint'],
      status: 'Active',
    },
    {
      id: 'r3',
      regionCode: 'ISO-3166:GEN',
      documentType: 'Unknown Identity Doc',
      securityFeatures: ['Basic OCR'],
      status: 'Deprecated',
    },
  ]);

  const [showAddRuleModal, setShowAddRuleModal] = useState<boolean>(false);
  const [newRule, setNewRule] = useState<Partial<RegionalRule>>({
    status: 'Active',
    securityFeatures: ['UV Watermark'],
  });
  const [deployedSuccess, setDeployedSuccess] = useState<boolean>(false);

  const handleDeploy = () => {
    setDeployedSuccess(true);
    setTimeout(() => setDeployedSuccess(false), 3000);
  };

  const handleDiscard = () => {
    setFaceSimilarity(85.0);
    setOcrConfidence(92.5);
    setStrictJwt(true);
    setVerboseAudit(false);
    setSessionTimeout(15);
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.regionCode || !newRule.documentType) return;
    const rule: RegionalRule = {
      id: `r-${Date.now()}`,
      regionCode: newRule.regionCode,
      documentType: newRule.documentType,
      securityFeatures: newRule.securityFeatures || ['UV Watermark'],
      status: 'Active',
    };
    setRegionalRules([...regionalRules, rule]);
    setShowAddRuleModal(false);
    setNewRule({ status: 'Active', securityFeatures: ['UV Watermark'] });
  };

  return (
    <div className="space-y-6 pb-12 text-slate-200">
      {/* Top Header matching Stitch Screenshot 3 */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#152238] pb-5">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase block mb-1">
            ADMINISTRATOR ACCESS
          </span>
          <h2 className="text-3xl font-bold text-white tracking-tight font-sans">
            Engine Configuration
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed font-sans">
            Adjust core AI processing thresholds, document validation parameters, and system security policies. Changes are logged and require elevated clearance.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleDiscard}
            className="px-4 py-2 bg-[#0e192c] hover:bg-[#182a47] text-slate-300 border border-[#1b2b46] rounded-md text-xs font-mono font-bold uppercase transition"
          >
            DISCARD CHANGES
          </button>

          <button
            type="button"
            onClick={handleDeploy}
            className="px-4 py-2 bg-[#d4e4f7] hover:bg-white text-[#071326] font-bold text-xs uppercase tracking-wider rounded-md transition flex items-center gap-2 shadow-[0_0_15px_rgba(212,228,247,0.15)]"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            DEPLOY CONFIGURATION
          </button>
        </div>
      </div>

      {deployedSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 text-xs font-mono font-bold rounded-lg flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Configuration deployed and cryptographically anchored to system cluster.
        </div>
      )}

      {/* Top Grid: AI Processing Thresholds (Left) & Security & Auth (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: AI Processing Thresholds */}
        <div className="lg:col-span-8 bg-[#0b1424] border border-[#182740] rounded-xl p-5 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#182740] pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                AI Processing Thresholds
              </h3>
            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-[#070e1a] border border-[#15233a] text-cyan-400 text-[10px] font-mono font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
              Model: v4.2.0-SENTINEL
            </span>
          </div>

          <div className="space-y-6">
            {/* Control 1: Facial Recognition Similarity */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Facial Recognition Similarity
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Minimum confidence score required for an automatic match validation.
                  </p>
                </div>

                <span className="px-2.5 py-1 bg-[#070e1a] border border-[#182740] text-cyan-300 font-mono font-bold text-xs rounded-md">
                  {faceSimilarity.toFixed(1)}%
                </span>
              </div>

              <div className="pt-2">
                <input
                  type="range"
                  min="50"
                  max="99"
                  step="0.5"
                  value={faceSimilarity}
                  onChange={(e) => setFaceSimilarity(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#15233a] rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>Loose (50%)</span>
                  <span>Strict (99%)</span>
                </div>
              </div>
            </div>

            {/* Control 2: OCR Extraction Confidence */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-white">
                    OCR Extraction Confidence
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Threshold for raising a manual review flag during document text extraction.
                  </p>
                </div>

                <span className="px-2.5 py-1 bg-[#070e1a] border border-[#182740] text-cyan-300 font-mono font-bold text-xs rounded-md">
                  {ocrConfidence.toFixed(1)}%
                </span>
              </div>

              <div className="pt-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={ocrConfidence}
                  onChange={(e) => setOcrConfidence(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#15233a] rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Security & Auth */}
        <div className="lg:col-span-4 bg-[#0b1424] border border-[#182740] rounded-xl p-5 shadow-xl space-y-5">
          <div className="flex items-center gap-2 border-b border-[#182740] pb-3">
            <ShieldCheck className="w-4 h-4 text-[#f87171]" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Security &amp; Auth
            </h3>
          </div>

          <div className="space-y-4">
            {/* Setting 1: Strict JWT Validation */}
            <div className="flex items-center justify-between p-3 bg-[#070e1a] rounded-lg border border-[#15233a]">
              <div>
                <span className="text-xs font-bold text-white block">Strict JWT Validation</span>
                <span className="text-[10px] text-slate-400 block font-mono">Enforce IP binding on tokens</span>
              </div>
              <button
                type="button"
                onClick={() => setStrictJwt(!strictJwt)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  strictJwt ? 'bg-white' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-[#070d18] absolute top-0.5 transition-transform ${
                    strictJwt ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Setting 2: Verbose Audit Logging */}
            <div className="flex items-center justify-between p-3 bg-[#070e1a] rounded-lg border border-[#15233a]">
              <div>
                <span className="text-xs font-bold text-white block">Verbose Audit Logging</span>
                <span className="text-[10px] text-slate-400 block font-mono">Log read operations (high I/O)</span>
              </div>
              <button
                type="button"
                onClick={() => setVerboseAudit(!verboseAudit)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  verboseAudit ? 'bg-white' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-[#070d18] absolute top-0.5 transition-transform ${
                    verboseAudit ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Setting 3: Session Timeout */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold text-slate-300 block">Session Timeout (Minutes)</span>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(Number(e.target.value))}
                  className="w-full bg-[#070e1a] border border-[#182740] rounded-md pl-9 pr-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Card: Document Validation Engine Table matching Screenshot 3 */}
      <div className="bg-[#0b1424] border border-[#182740] rounded-xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-[#182740] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Document Validation Engine
            </h3>
          </div>

          <button
            onClick={() => setShowAddRuleModal(true)}
            className="px-3 py-1.5 bg-[#121f35] hover:bg-[#182a47] text-slate-300 hover:text-white border border-[#223553] text-[11px] font-mono font-bold uppercase rounded transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Regional Rule
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#070e1a] text-slate-400 font-mono text-[10px] uppercase border-b border-[#182740]">
              <tr>
                <th className="py-3 px-5">Region Code</th>
                <th className="py-3 px-5">Document Type</th>
                <th className="py-3 px-5">Required Security Features</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#15233a] font-mono text-[11px]">
              {regionalRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-[#101b2f] transition">
                  <td className="py-3 px-5 font-bold text-slate-300">
                    {rule.regionCode}
                  </td>
                  <td className="py-3 px-5 text-slate-200 font-sans">
                    {rule.documentType}
                  </td>
                  <td className="py-3 px-5">
                    <div className="flex flex-wrap gap-1.5">
                      {rule.securityFeatures.map((feat) => (
                        <span
                          key={feat}
                          className="px-2 py-0.5 bg-[#070e1a] border border-[#182740] text-slate-300 text-[10px] rounded font-sans"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-5">
                    <span className={`flex items-center gap-1.5 text-xs font-sans ${
                      rule.status === 'Active' ? 'text-white' : 'text-slate-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        rule.status === 'Active' ? 'bg-white shadow-[0_0_6px_#fff]' : 'bg-slate-500'
                      }`} />
                      {rule.status}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-right">
                    <button className="text-slate-400 hover:text-white p-1 transition">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Regional Rule Modal */}
      {showAddRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1424] border border-[#1e304f] rounded-xl p-5 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#182740] pb-3 mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Add Regional Validation Rule
              </h3>
              <button onClick={() => setShowAddRuleModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRule} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Region Code (ISO):</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ISO-3166:IN"
                  value={newRule.regionCode || ''}
                  onChange={(e) => setNewRule({ ...newRule, regionCode: e.target.value })}
                  className="w-full bg-[#070e1a] border border-[#182740] rounded-md p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Document Type:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indian Diplomatic Passport"
                  value={newRule.documentType || ''}
                  onChange={(e) => setNewRule({ ...newRule, documentType: e.target.value })}
                  className="w-full bg-[#070e1a] border border-[#182740] rounded-md p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Security Features (comma separated):</label>
                <input
                  type="text"
                  placeholder="UV Watermark, Guilloche Pattern, Optical Variable Ink"
                  onChange={(e) =>
                    setNewRule({
                      ...newRule,
                      securityFeatures: e.target.value.split(',').map((s) => s.trim()),
                    })
                  }
                  className="w-full bg-[#070e1a] border border-[#182740] rounded-md p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#182740]">
                <button
                  type="button"
                  onClick={() => setShowAddRuleModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md font-bold"
                >
                  Add Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
