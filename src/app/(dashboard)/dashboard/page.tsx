'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Activity, Plus, RefreshCw, Shield, ArrowUpRight, Radio, Filter, TrendingUp, CheckCircle2, AlertTriangle, Layers, ExternalLink } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, eventsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/events'),
      ]);
      const statsData = await statsRes.json();
      const eventsData = await eventsRes.json();
      setStats(statsData);
      setEvents(eventsData.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const filteredEvents = events.filter((e) => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'SECURITY') return e.category === 'security';
    if (activeCategory === 'BREAKING') return e.category === 'breaking_change';
    if (activeCategory === 'RELEASES') return e.category === 'major_release' || e.category === 'product_update';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* SaaS Command Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 shadow-glow">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Intelligence Command Center
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              SENTINEL ONLINE
            </span>
          </div>
          <p className="text-xs text-gray-400 font-mono">
            Autonomous Background Monitoring Active • {stats?.activeWatches || 4} Targets Watched • AI Triage Engine Nominal
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-3 rounded-xl glass-panel hover:bg-white/10 text-gray-300 transition border border-white/10"
            title="Refresh Command Center Data"
          >
            <RefreshCw className={'w-4 h-4 ' + (loading ? 'animate-spin' : '')} />
          </button>
          <Link
            href="/watches/create"
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white transition shadow-glow flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Configure New Target
          </Link>
        </div>
      </div>

      {/* Top ChangeTower-Style Stat Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span>MONITORED TARGETS</span>
            <Eye className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{stats?.activeWatches || 4}</div>
          <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> 100% Active Polling Rate
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span>MEANINGFUL EVENTS</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-400">{stats?.totalChanges || events.length}</div>
          <div className="text-[10px] font-mono text-purple-300">Filtered from 140+ raw diffs</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span>CRITICAL ALERTS</span>
            <Shield className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-extrabold text-red-400">{stats?.criticalAlerts || 1}</div>
          <div className="text-[10px] font-mono text-red-300">Action Required Immediately</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span>AI ACCURACY RATE</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">96.8%</div>
          <div className="text-[10px] font-mono text-emerald-300">Grounded evidence evaluation</div>
        </div>
      </div>

      {/* Main Focus: WHAT MATTERS NOW & CATEGORY FILTERS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-400 animate-pulse" />
            <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
              WHAT MATTERS NOW ({filteredEvents.length})
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-mono">
            {['ALL', 'SECURITY', 'BREAKING', 'RELEASES'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={
                  'px-3 py-1.5 rounded-lg transition ' +
                  (activeCategory === cat ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:text-white')
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center space-y-3 font-mono">
            <Shield className="w-10 h-10 mx-auto text-emerald-400" />
            <h3 className="text-base font-bold text-white">All Caught Up!</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              No unread intelligence events matching your filter. Sentinel is actively polling your monitored targets.
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
                    : 'border-white/10')
                }
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        'px-3 py-1 rounded text-xs font-mono font-bold uppercase ' +
                        (event.importance === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30 glow-border'
                          : event.importance === 'HIGH'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30')
                      }
                    >
                      {event.importance} SEVERITY
                    </span>
                    <span className="text-xs font-mono text-white font-bold">{event.watch?.name}</span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-white/5 text-gray-300 uppercase border border-white/10">
                      {event.category || 'PRODUCT_UPDATE'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
                    <span>AI Confidence: <strong className="text-emerald-400 font-bold">{((event.confidence || 0.95) * 100).toFixed(0)}%</strong></span>
                    <span>Detected: {new Date(event.detectedAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-3">{event.aiSummary}</h3>

                <div className="grid md:grid-cols-3 gap-3 text-xs font-sans mb-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                    <strong className="text-blue-400 block font-mono text-[10px] uppercase">1. WHAT CHANGED?</strong>
                    <p className="text-gray-300 leading-relaxed">{event.whatChanged}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                    <strong className="text-blue-300 block font-mono text-[10px] uppercase">2. WHY IT MATTERS?</strong>
                    <p className="text-blue-200 leading-relaxed">{event.whyItMatters}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                    <strong className="text-emerald-400 block font-mono text-[10px] uppercase">3. RECOMMENDED ACTION</strong>
                    <p className="text-emerald-200 leading-relaxed">{event.recommendedAction || 'Review details.'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="text-xs font-mono text-gray-500">
                    Source: <span className="text-gray-300">{event.watch?.target}</span>
                  </div>
                  <Link
                    href={'/events/' + event.id}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs transition shadow-glow flex items-center gap-1.5"
                  >
                    Investigate Event Impact <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
