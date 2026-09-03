'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Radio, Shield, ArrowUpRight, Search, Filter, RefreshCw, ExternalLink, Activity } from 'lucide-react';

export default function IntelligenceFeedPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSeverity, setActiveSeverity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      setEvents(data.events || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((e) => {
    const matchesSeverity = activeSeverity === 'ALL' || e.importance === activeSeverity;
    const matchesSearch = searchQuery
      ? e.aiSummary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.whatChanged?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.watch?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesSeverity && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-white/10 shadow-glow">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 font-mono">
              <Radio className="w-6 h-6 text-blue-400 animate-pulse" />
              Real-Time Intelligence Feed
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              LIVE STREAM
            </span>
          </div>
          <p className="text-xs text-gray-400 font-mono">
            Structured change intelligence stream evaluated by Claude AI
          </p>
        </div>

        <button
          onClick={fetchEvents}
          className="p-2.5 rounded-xl glass-panel hover:bg-white/10 text-gray-300 transition border border-white/10 flex items-center gap-2 text-xs font-mono"
        >
          <RefreshCw className={'w-4 h-4 ' + (loading ? 'animate-spin' : '')} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search feed by keyword, target, diff..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              onClick={() => setActiveSeverity(sev)}
              className={
                'px-3 py-1.5 rounded-xl transition border ' +
                (activeSeverity === sev
                  ? sev === 'CRITICAL'
                    ? 'bg-red-500/30 text-red-300 border-red-500/50 font-bold'
                    : sev === 'HIGH'
                    ? 'bg-orange-500/30 text-orange-300 border-orange-500/50 font-bold'
                    : 'bg-blue-600/30 text-blue-300 border-blue-500/50 font-bold'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:text-white')
              }
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center space-y-4 font-mono">
          <Shield className="w-10 h-10 mx-auto text-emerald-400" />
          <h3 className="text-lg font-bold text-white">No Events Found</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            No intelligence events match your current filters. Sentinel will surface new meaningful changes as they are detected.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className={
                'glass-panel p-6 rounded-2xl border transition glass-panel-hover ' +
                (event.importance === 'CRITICAL'
                  ? 'border-red-500/30 bg-red-500/5 shadow-glow-red'
                  : event.importance === 'HIGH'
                  ? 'border-orange-500/30 bg-orange-500/5'
                  : 'border-white/10')
              }
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={
                      'px-3 py-1 rounded text-xs font-mono font-bold uppercase ' +
                      (event.importance === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : event.importance === 'HIGH'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30')
                    }
                  >
                    {event.importance}
                  </span>
                  <span className="text-xs font-mono text-white font-bold">{event.watch?.name}</span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-white/5 text-gray-300 uppercase border border-white/10">
                    {event.category || 'PRODUCT_UPDATE'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
                  <span>AI Confidence: <strong className="text-emerald-400 font-bold">{((event.confidence || 0.95) * 100).toFixed(0)}%</strong></span>
                  <span>{new Date(event.detectedAt).toLocaleString()}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-3">{event.aiSummary}</h3>

              <div className="grid md:grid-cols-3 gap-3 text-xs font-sans mb-4">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <strong className="text-blue-400 block font-mono text-[10px] uppercase">WHAT CHANGED?</strong>
                  <p className="text-gray-300 leading-relaxed">{event.whatChanged}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                  <strong className="text-blue-300 block font-mono text-[10px] uppercase">WHY IT MATTERS?</strong>
                  <p className="text-blue-200 leading-relaxed">{event.whyItMatters}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                  <strong className="text-emerald-400 block font-mono text-[10px] uppercase">RECOMMENDED ACTION</strong>
                  <p className="text-emerald-200 leading-relaxed">{event.recommendedAction || 'Review details.'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs font-mono">
                <span className="text-gray-500">Target: <strong className="text-gray-300">{event.watch?.target}</strong></span>
                <Link
                  href={'/events/' + event.id}
                  className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-bold transition flex items-center gap-1.5"
                >
                  Investigate Event <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
