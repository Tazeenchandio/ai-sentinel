'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, AlertCircle } from 'lucide-react';

export default function CreateWatchPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('GITHUB_REPO');
  const [target, setTarget] = useState('');
  const [checkIntervalMins, setCheckIntervalMins] = useState(60);
  const [targetImportance, setTargetImportance] = useState('HIGH');
  const [keywords, setKeywords] = useState('');
  const [aiInstructions, setAiInstructions] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const parsedKeywords = keywords ? keywords.split(',').map((k) => k.trim()).filter((k) => k.length > 0) : [];

    try {
      const res = await fetch('/api/watches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          type,
          target,
          checkIntervalMins,
          targetImportance,
          keywords: parsedKeywords,
          aiInstructions,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create watch.');

      router.push('/watches');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Create New Watch</h1>
        <p className="text-xs text-gray-400 font-mono">CONFIGURE SOURCE & AI TRIAGE INSTRUCTIONS</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-5">
        <div>
          <label className="block text-xs font-mono text-gray-400 mb-1">WATCH NAME</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Anthropic TypeScript SDK"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-400 mb-1">WATCH PROVIDER TYPE</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="GITHUB_REPO">GitHub Repository (Releases & Commits)</option>
            <option value="WEBSITE">Website Page (DOM Semantic Diff)</option>
            <option value="RSS_FEED">RSS / Atom Feed</option>
            <option value="TOPIC_WATCH">Topic / Research Watch</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-400 mb-1">TARGET URL / REPO / TOPIC</label>
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder={
              type === 'GITHUB_REPO'
                ? 'owner/repo (e.g. anthropic-ai/anthropic-sdk-typescript)'
                : type === 'WEBSITE'
                ? 'https://example.com/pricing'
                : type === 'RSS_FEED'
                ? 'https://blog.example.com/feed'
                : 'AI coding agent autonomous repository editing'
            }
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-400 mb-1">AI CUSTOM INSTRUCTIONS</label>
          <textarea
            value={aiInstructions}
            onChange={(e) => setAiInstructions(e.target.value)}
            placeholder="e.g. Only alert me about breaking API changes, deprecation notices, or major releases."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 h-24"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">IMPORTANCE THRESHOLD</label>
            <select
              value={targetImportance}
              onChange={(e) => setTargetImportance(e.target.value)}
              className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">CHECK INTERVAL (MINUTES)</label>
            <input
              type="number"
              value={checkIntervalMins}
              onChange={(e) => setCheckIntervalMins(Number(e.target.value))}
              min={15}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-sm text-white transition shadow-glow flex items-center justify-center gap-2"
        >
          {loading ? 'Initializing Watch...' : 'Activate Watch'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
