'use client';
import Link from 'next/link';
import {
  Shield,
  ArrowRight,
  Radio,
  Globe,
  Github,
  Rss,
  Search,
  Cpu,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#060911] text-white selection:bg-blue-600 selection:text-white">
      <header className="border-b border-white/10 px-6 sm:px-12 py-4 glass-panel sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-glow">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-wider font-mono block">AI SENTINEL</span>
            <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> 2030 PLATFORM • ONLINE
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-mono text-gray-300">
          <a href="#features" className="hover:text-blue-400 transition">FEATURES</a>
          <a href="#comparison" className="hover:text-blue-400 transition">WHY SENTINEL</a>
          <Link href="/demo" className="text-amber-400 hover:text-amber-300 transition flex items-center gap-1">
            ● LIVE DEMO
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-xs font-mono font-medium text-gray-300 hover:text-white transition px-3 py-2">
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-glow flex items-center gap-1.5"
          >
            Start Free Trial
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center space-y-8">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono">
          <Radio className="w-4 h-4 animate-pulse text-blue-400" />
          <span>AUTONOMOUS CHANGE INTELLIGENCE & BACKGROUND MONITORING PLATFORM</span>
        </div>

        <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto">
          Don't Monitor Everything. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            Let AI Watch What Matters.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
          AI Sentinel continuously monitors websites, GitHub repositories, RSS feeds, and developer documentation — filtering out 98% of trivial noise and delivering actionable impact intelligence.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link
            href="/demo"
            className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition shadow-glow flex items-center justify-center gap-2"
          >
            Explore Live Demo Workspace
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/watches/create"
            className="px-8 py-4 rounded-xl glass-panel hover:bg-white/10 text-gray-200 font-bold text-sm transition flex items-center justify-center gap-2 border border-white/10"
          >
            Configure First Watch Target
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 font-mono text-xs text-left">
          <div className="glass-panel p-4 rounded-xl border border-white/10">
            <div className="text-gray-400 mb-1">NOISE FILTERED</div>
            <div className="text-xl font-bold text-emerald-400">98.4%</div>
            <div className="text-[10px] text-gray-500 pt-1">AI Triage suppression</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-white/10">
            <div className="text-gray-400 mb-1">AVERAGE SCAN LATENCY</div>
            <div className="text-xl font-bold text-blue-400">&lt; 1.2s</div>
            <div className="text-[10px] text-gray-500 pt-1">DOM & diff hashing</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-white/10">
            <div className="text-gray-400 mb-1">AI CONFIDENCE</div>
            <div className="text-xl font-bold text-purple-400">96.8%</div>
            <div className="text-[10px] text-gray-500 pt-1">Source evidence grounded</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-white/10">
            <div className="text-gray-400 mb-1">SSRF SECURITY SHIELD</div>
            <div className="text-xl font-bold text-emerald-400">ACTIVE</div>
            <div className="text-[10px] text-gray-500 pt-1">DNS & IP blocker active</div>
          </div>
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Built for High-Stakes Monitoring</h2>
          <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">
            ENTERPRISE CAPABILITIES • BUILT FOR AI ARCHITECTS & DEVOPS TEAMS
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3 glass-panel-hover">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 w-fit">
              <Github className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">GitHub Repo & Release Tracking</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Monitors releases, commits, tag updates, and API modifications in open-source repositories.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3 glass-panel-hover">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 w-fit">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">DOM Semantic Web Page Diffs</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Strips ads, scripts, nav bars, and cosmetic noise to isolate actual content changes.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3 glass-panel-hover">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Evidence-Grounded AI Triage</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Dual-stage Claude 3.5 Haiku and Sonnet analysis strictly grounded in detected snapshot diffs.
            </p>
          </div>
        </div>
      </section>

      <section id="comparison" className="max-w-5xl mx-auto px-6 py-12">
        <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-6">
          <h2 className="text-center text-sm font-mono text-blue-400 uppercase tracking-widest">
            TRADITIONAL MONITORING VS. AI SENTINEL
          </h2>

          <div className="grid md:grid-cols-2 gap-6 text-xs font-mono">
            <div className="p-5 rounded-xl bg-red-500/5 border border-red-500/20 space-y-3">
              <div className="font-bold text-red-400 uppercase">TRADITIONAL MONITORS</div>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✕</span> Spams inbox for every CSS, timestamp, or footer link update.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✕</span> Requires manual review of thousands of unformatted text lines.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✕</span> No understanding of breaking API changes or vulnerability risks.
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 shadow-glow">
              <div className="font-bold text-emerald-400 uppercase">AI SENTINEL PLATFORM</div>
              <ul className="space-y-2 text-emerald-200">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span> Filters 98% of trivial formatting noise before notifying you.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span> Generates structured 4-question executive reports instantly.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span> Cites explicit source evidence for security & breaking impact.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-8 py-8 text-center text-xs font-mono text-gray-500">
        AI Sentinel © 2030 • Enterprise Autonomous Background Intelligence Platform.
      </footer>
    </div>
  );
}
