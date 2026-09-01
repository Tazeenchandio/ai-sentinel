'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<'feed' | 'watches' | 'detail'>('feed');

  const demoEvents = [
    {
      id: 'demo-1',
      watchName: 'Anthropic TypeScript SDK',
      type: 'GITHUB_REPO',
      severity: 'CRITICAL',
      time: '3 hours ago',
      title: 'Tool calling schema signature refactored in SDK v0.26.0',
      whatChanged: 'Deprecated legacy prompt tool call format in favor of strict JSON schema input definitions.',
      whyItMatters: 'Existing code using custom tool schemas will fail at runtime without migrating to the input_schema structure.',
      diff: '- tool_choice: "auto"\n+ input_schema: { type: "object", properties: { ... } }',
    },
    {
      id: 'demo-2',
      watchName: 'OpenAI API Pricing & Models',
      type: 'WEBSITE',
      severity: 'HIGH',
      time: '8 hours ago',
      title: '50% Price Reduction detected for GPT-4o input tokens',
      whatChanged: 'OpenAI reduced GPT-4o input token pricing from $5.00 to $2.50 per 1M tokens.',
      whyItMatters: 'Direct 50% operational cost reduction for high-volume background scanning pipelines.',
      diff: '- GPT-4o Input: $5.00 / 1M tokens\n+ GPT-4o Input: $2.50 / 1M tokens (50% reduction)',
    },
  ];

  const [selectedEvent, setSelectedEvent] = useState(demoEvents[0]);

  return (
    <div className="min-h-screen bg-[#060911] text-white">
      <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-amber-300">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <strong className="font-bold">DEMO WORKSPACE — SIMULATED INTELLIGENCE ENVIRONMENT</strong>
        </div>
        <Link href="/register" className="px-3 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 font-bold transition">
          Exit Demo & Create Account →
        </Link>
      </div>

      <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 font-mono">
              <Shield className="w-6 h-6 text-blue-400" />
              Demo Command Center
            </h1>
            <p className="text-xs text-gray-400 font-mono">READ-ONLY INTERACTIVE EXPLORATION</p>
          </div>
          <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10 font-mono text-xs">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'feed' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Feed
            </button>
            <button
              onClick={() => setActiveTab('watches')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'watches' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Watches (4)
            </button>
          </div>
        </div>

        {activeTab === 'feed' && (
          <div className="space-y-4">
            {demoEvents.map((e) => (
              <div key={e.id} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                      {e.severity}
                    </span>
                    <span className="text-xs font-mono text-gray-400">{e.watchName}</span>
                  </div>
                  <span className="text-xs font-mono text-gray-500">{e.time}</span>
                </div>

                <h3 className="text-base font-bold text-white">{e.title}</h3>

                <div className="grid md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                    <strong className="text-blue-400 block font-mono text-[10px] uppercase">WHAT CHANGED</strong>
                    <p className="text-gray-300">{e.whatChanged}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <strong className="text-blue-300 block font-mono text-[10px] uppercase">WHY IT MATTERS</strong>
                    <p className="text-blue-200">{e.whyItMatters}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedEvent(e);
                    setActiveTab('detail');
                  }}
                  className="text-xs font-mono text-blue-400 hover:underline font-semibold pt-1 block"
                >
                  Investigate Demo Report →
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'watches' && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-400 font-bold">GITHUB_REPO</span>
              <h3 className="font-bold text-white">Anthropic TypeScript SDK</h3>
              <p className="text-xs font-mono text-gray-400">anthropic-ai/anthropic-sdk-typescript</p>
              <div className="text-xs text-emerald-400 font-mono pt-2">● ACTIVE • 3 Events Detected</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-400 font-bold">WEBSITE</span>
              <h3 className="font-bold text-white">OpenAI API Pricing & Models</h3>
              <p className="text-xs font-mono text-gray-400">https://openai.com/api/pricing</p>
              <div className="text-xs text-emerald-400 font-mono pt-2">● ACTIVE • 1 Event Detected</div>
            </div>
          </div>
        )}

        {activeTab === 'detail' && selectedEvent && (
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
            <button onClick={() => setActiveTab('feed')} className="text-xs font-mono text-blue-400 hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Feed
            </button>
            <h2 className="text-2xl font-bold">{selectedEvent.title}</h2>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <strong className="text-blue-400 text-xs font-mono uppercase block">1. WHAT CHANGED?</strong>
              <p className="text-sm">{selectedEvent.whatChanged}</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2">
              <strong className="text-blue-300 text-xs font-mono uppercase block">2. WHY IT MATTERS?</strong>
              <p className="text-sm text-blue-200">{selectedEvent.whyItMatters}</p>
            </div>
            <div className="p-4 rounded-xl bg-black/60 font-mono text-xs space-y-1">
              <span className="text-gray-500 block mb-1">// SEMANTIC DIFF</span>
              <pre className="text-gray-300">{selectedEvent.diff}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
