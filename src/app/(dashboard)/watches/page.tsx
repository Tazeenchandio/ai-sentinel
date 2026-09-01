'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Play, Trash2, ExternalLink, RefreshCw, CheckCircle2, AlertCircle, Eye, Search, Filter, Globe, Github, Rss, Layers } from 'lucide-react';

export default function WatchesPage() {
  const [watches, setWatches] = useState<any[]>([]);
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const loadWatches = async () => {
    try {
      const res = await fetch('/api/watches');
      const data = await res.json();
      setWatches(data.watches || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadWatches();
  }, []);

  const handleScanNow = async (id: string, name: string) => {
    setScanningId(id);
    setFeedback(null);
    try {
      const res = await fetch('/api/watches/' + id + '/scan', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Scan failed.');
      }
      setFeedback({
        type: 'success',
        message: data.eventCreated
          ? 'Scan complete for "' + name + '": New meaningful intelligence event created!'
          : 'Scan complete for "' + name + '": No content changes detected.',
      });
      await loadWatches();
    } catch (e: any) {
      setFeedback({ type: 'error', message: 'Scan failed for "' + name + '": ' + e.message });
    } finally {
      setScanningId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this watch?')) return;
    try {
      await fetch('/api/watches/' + id, { method: 'DELETE' });
      loadWatches();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredWatches = watches.filter((w) => {
    const matchesType = typeFilter === 'ALL' || w.type === typeFilter;
    const matchesQuery = searchQuery
      ? w.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.target?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesType && matchesQuery;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 font-mono">
            <Eye className="w-6 h-6 text-blue-400" />
            Watch System Manager
          </h1>
          <p className="text-xs text-gray-400 font-mono">ACTIVE TARGET MONITORS & CONTENT REPOSITORIES</p>
        </div>
        <Link
          href="/watches/create"
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white transition shadow-glow flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Watch Target
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter target monitors..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {['ALL', 'GITHUB_REPO', 'WEBSITE', 'RSS_FEED', 'TOPIC_WATCH'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={
                'px-3 py-1.5 rounded-xl transition border ' +
                (typeFilter === t
                  ? 'bg-blue-600/30 text-blue-300 border-blue-500/50 font-bold'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:text-white')
              }
            >
              {t === 'ALL' ? 'ALL PROVIDERS' : t}
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div
          className={
            'p-4 rounded-xl text-xs font-mono flex items-center gap-3 border ' +
            (feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300')
          }
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {filteredWatches.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center space-y-4 font-mono">
          <h3 className="text-lg font-bold text-white">No Watch Targets Found.</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">Create a new watch target to let AI Sentinel begin background polling.</p>
          <Link href="/watches/create" className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-glow">
            Configure Watch Target
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredWatches.map((watch) => {
            const isScanning = scanningId === watch.id;
            return (
              <div key={watch.id} className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between glass-panel-hover space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                      {watch.type === 'GITHUB_REPO' && <Github className="w-3 h-3" />}
                      {watch.type === 'WEBSITE' && <Globe className="w-3 h-3" />}
                      {watch.type === 'RSS_FEED' && <Rss className="w-3 h-3" />}
                      {watch.type}
                    </span>
                    <span className="text-[11px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      CHECK INTERVAL: {watch.checkIntervalMins}M
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-white mb-1">{watch.name}</h3>
                  <p className="text-xs font-mono text-blue-400 mb-3 truncate">{watch.target}</p>
                  {watch.aiInstructions && (
                    <p className="text-xs text-purple-200/90 bg-purple-500/10 p-3 rounded-xl border border-purple-500/20 line-clamp-2">
                      <span className="font-mono font-bold text-purple-400 block mb-0.5">AI DIRECTIVE:</span>
                      {watch.aiInstructions}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-gray-400">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    STATUS: <strong className="text-emerald-400 font-bold">{isScanning ? 'SCANNING...' : watch.status}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleScanNow(watch.id, watch.name)}
                      disabled={isScanning}
                      className="px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 transition flex items-center gap-1.5 disabled:opacity-50 font-bold"
                    >
                      <RefreshCw className={'w-3.5 h-3.5 ' + (isScanning ? 'animate-spin' : '')} />
                      {isScanning ? 'Scanning...' : 'Scan Now'}
                    </button>
                    <Link
                      href={'/watches/' + watch.id}
                      className="p-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 transition"
                      title="View Details & Timeline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(watch.id)}
                      className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition"
                      title="Delete Watch"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
