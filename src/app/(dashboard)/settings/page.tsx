'use client';
import { useState } from 'react';
import { Settings, Cpu, Shield, Bell, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [triageModel, setTriageModel] = useState('claude-3-5-haiku-20241022');
  const [analysisModel, setAnalysisModel] = useState('claude-3-5-sonnet-20241022');
  const [minAlertLevel, setMinAlertLevel] = useState('MEDIUM');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-glow">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 font-mono">
          <Settings className="w-6 h-6 text-blue-400" />
          Settings & AI Model Configurations
        </h1>
        <p className="text-xs text-gray-400 font-mono">Configure autonomous AI analysis models and notification thresholds</p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Settings updated successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* AI Model Settings */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            AI Intelligence Models
          </h2>

          <div className="grid md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-gray-400 mb-1.5">TRIAGE & NOISE FILTER MODEL</label>
              <select
                value={triageModel}
                onChange={(e) => setTriageModel(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="claude-3-5-haiku-20241022" className="bg-[#080c14]">Claude 3.5 Haiku (Fast & Cost-Efficient)</option>
                <option value="claude-3-5-sonnet-20241022" className="bg-[#080c14]">Claude 3.5 Sonnet (Deep Reasoning)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 mb-1.5">DEEP IMPACT ANALYSIS MODEL</label>
              <select
                value={analysisModel}
                onChange={(e) => setAnalysisModel(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="claude-3-5-sonnet-20241022" className="bg-[#080c14]">Claude 3.5 Sonnet (Recommended)</option>
                <option value="claude-3-opus-20240229" className="bg-[#080c14]">Claude 3 Opus (High Precision)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-400" />
            Alert Thresholds
          </h2>

          <div className="text-xs font-mono">
            <label className="block text-gray-400 mb-1.5">MINIMUM NOTIFICATION SEVERITY LEVEL</label>
            <select
              value={minAlertLevel}
              onChange={(e) => setMinAlertLevel(e.target.value)}
              className="w-full md:w-80 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="LOW" className="bg-[#080c14]">LOW (All detected changes)</option>
              <option value="MEDIUM" className="bg-[#080c14]">MEDIUM (Moderate & above)</option>
              <option value="HIGH" className="bg-[#080c14]">HIGH (Important releases & breaks)</option>
              <option value="CRITICAL" className="bg-[#080c14]">CRITICAL (Security vulnerabilities only)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold transition shadow-glow"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
