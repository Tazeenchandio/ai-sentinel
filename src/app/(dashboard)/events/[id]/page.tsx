'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle2, Radio, ExternalLink, Cpu, Tag, Database, FileText } from 'lucide-react';

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/events/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Event not found or failed to load.');
        return res.json();
      })
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setEvent(data.event);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-3 font-mono text-gray-400">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p>Loading Intelligence Event ${params.id}...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto py-16 space-y-4">
        <Link href="/feed" className="inline-flex items-center gap-2 text-xs font-mono text-blue-400 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Feed
        </Link>
        <div className="glass-panel p-8 rounded-2xl border border-red-500/30 bg-red-500/10 text-center text-red-300 font-mono">
          <h2 className="text-lg font-bold mb-2">Event Not Found</h2>
          <p className="text-xs text-red-400/80">{error || 'The requested event ID could not be retrieved from the database.'}</p>
        </div>
      </div>
    );
  }

  let affectedAreas: string[] = [];
  let tags: string[] = [];
  try {
    affectedAreas = typeof event.affectedAreas === 'string' ? JSON.parse(event.affectedAreas) : event.affectedAreas || [];
  } catch (e) {}
  try {
    tags = typeof event.tags === 'string' ? JSON.parse(event.tags) : event.tags || [];
  } catch (e) {}

  const targetUrl = event.watch?.target
    ? event.watch.target.startsWith('http')
      ? event.watch.target
      : `https://github.com/${event.watch.target}`
    : '#';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header & Links */}
      <div className="flex items-center justify-between">
        <Link href="/feed" className="inline-flex items-center gap-2 text-xs font-mono text-blue-400 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Intelligence Feed
        </Link>

        {/* Source Link */}
        {event.watch?.target && (
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-mono font-semibold transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Verify Original Source Link
          </a>
        )}
      </div>

      {/* Main Intelligence Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
        <div className="border-b border-white/10 pb-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider ${
                  event.importance === 'CRITICAL'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 glow-border'
                    : event.importance === 'HIGH'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}
              >
                {event.importance} SEVERITY
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-white/5 text-gray-300 border border-white/10 uppercase">
                {event.category || 'PRODUCT_UPDATE'}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
              <span>AI Confidence: <strong className="text-emerald-400 font-bold">{((event.confidence || 0.95) * 100).toFixed(0)}%</strong></span>
              <span>Detected: {new Date(event.detectedAt).toLocaleString()}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{event.aiSummary}</h1>

          {event.watch && (
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400 pt-1">
              <span>WATCH TARGET:</span>
              <span className="text-blue-400 font-semibold">{event.watch.name} ({event.watch.target})</span>
            </div>
          )}
        </div>

        {/* Structured Breakdown */}
        <div className="grid gap-4">
          <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-blue-400 font-bold">
              <Radio className="w-4 h-4" />
              <span>1. WHAT CHANGED?</span>
            </div>
            <p className="text-sm text-gray-200 leading-relaxed">{event.whatChanged}</p>
          </div>

          <div className="p-5 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-blue-300 font-bold">
              <Shield className="w-4 h-4" />
              <span>2. WHY DOES IT MATTER?</span>
            </div>
            <p className="text-sm text-blue-200 leading-relaxed">{event.whyItMatters}</p>
          </div>

          <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>3. WHAT SHOULD I DO? (RECOMMENDED ACTION)</span>
            </div>
            <p className="text-sm text-emerald-200 leading-relaxed">
              {event.recommendedAction || 'Review the details above to assess impact on your workflow.'}
            </p>
          </div>
        </div>

        {/* Evidence Section */}
        <div className="p-5 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-purple-300 font-bold uppercase">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span>SOURCE EVIDENCE & GROUNDING DATA</span>
            </div>
            <span>TYPE: {event.watch?.type}</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-xs font-mono text-gray-300">
            <div className="p-3 rounded bg-black/40 border border-white/5">
              <span className="text-gray-500 block mb-1">EVENT TYPE:</span>
              <span className="text-purple-300 font-bold">{event.eventType}</span>
            </div>
            <div className="p-3 rounded bg-black/40 border border-white/5">
              <span className="text-gray-500 block mb-1">CONFIDENCE RATIONALE:</span>
              <span className="text-gray-300">Evidence grounded in source text diff.</span>
            </div>
          </div>
        </div>

        {/* Semantic Diff */}
        {event.diffSummary && (
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase text-gray-400 font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              SEMANTIC DIFF EVIDENCE
            </h3>
            <div className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs overflow-x-auto space-y-1">
              <pre className="text-gray-300 whitespace-pre-wrap">{event.diffSummary}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
