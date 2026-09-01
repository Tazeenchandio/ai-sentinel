'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function WatchDetailPage({ params }: { params: { id: string } }) {
  const [watch, setWatch] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchWatch = async () => {
    const res = await fetch(`/api/watches/${params.id}`);
    const data = await res.json();
    setWatch(data.watch);
  };

  useEffect(() => {
    fetchWatch();
  }, [params.id]);

  const handleScanNow = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/watches/${params.id}/scan`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Scan failed.');
      }
      setFeedback({
        type: 'success',
        message: data.eventCreated
          ? 'Scan completed successfully. New meaningful intelligence event created!'
          : 'Scan completed successfully. No content changes detected.',
      });
      await fetchWatch();
    } catch (e: any) {
      setFeedback({ type: 'error', message: `Scan failed: ${e.message}` });
    } finally {
      setLoading(false);
    }
  };

  if (!watch) return <div className="text-center font-mono py-12 text-gray-400">Loading Watch Target...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/watches" className="inline-flex items-center gap-2 text-xs font-mono text-blue-400 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Watch Manager
      </Link>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-mono flex items-center gap-3 border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {watch.type}
            </span>
            <h1 className="text-2xl font-bold text-white mt-1">{watch.name}</h1>
            <p className="text-xs font-mono text-gray-400">{watch.target}</p>
          </div>
          <button
            onClick={handleScanNow}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white transition shadow-glow flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {loading ? 'Scanning Target...' : 'Run Scan Now'}
          </button>
        </div>

        {watch.aiInstructions && (
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs">
            <span className="font-mono font-bold text-purple-400 block mb-1">AI CUSTOM INSTRUCTIONS</span>
            <p className="text-purple-200">{watch.aiInstructions}</p>
          </div>
        )}

        <div>
          <h2 className="text-sm font-bold text-white mb-3">Recent Intelligence Events ({watch.events?.length || 0})</h2>
          <div className="space-y-3">
            {watch.events?.map((e: any) => (
              <Link key={e.id} href={`/events/${e.id}`} className="block p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-white">{e.aiSummary}</span>
                  <span className="text-[10px] font-mono text-gray-500">{new Date(e.detectedAt).toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-300">{e.whyItMatters}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
