'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Eye, Radio, ArrowUpRight, FileText } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<{ watches: any[]; events: any[] }>({ watches: [], events: [] });
  const [loading, setLoading] = useState(false);

  const performSearch = async (term: string) => {
    if (!term.trim()) {
      setResults({ watches: [], events: [] });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/search?q=' + encodeURIComponent(term));
      const data = await res.json();
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-glow space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 font-mono">
            <Search className="w-6 h-6 text-blue-400" />
            Global Intelligence Search
          </h1>
          <p className="text-xs text-gray-400 font-mono">Query across all target monitors, diffs, and AI analysis reports</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords, repository names, CVE IDs, or summaries..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-24 py-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold transition"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        {results.watches.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4" />
              MATCHING WATCH TARGETS ({results.watches.length})
            </h2>
            <div className="grid gap-3">
              {results.watches.map((w) => (
                <Link
                  key={w.id}
                  href={'/watches/' + w.id}
                  className="glass-panel p-4 rounded-xl border border-white/10 hover:border-blue-500/30 transition block"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{w.name}</span>
                    <span className="text-xs font-mono text-blue-400">{w.type}</span>
                  </div>
                  <p className="text-xs font-mono text-gray-400 mt-1">{w.target}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {results.events.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4" />
              MATCHING INTELLIGENCE EVENTS ({results.events.length})
            </h2>
            <div className="grid gap-3">
              {results.events.map((e) => (
                <Link
                  key={e.id}
                  href={'/events/' + e.id}
                  className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-blue-500/30 transition block space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase">
                      {e.importance}
                    </span>
                    <span className="text-[11px] font-mono text-gray-500">{new Date(e.detectedAt).toLocaleString()}</span>
                  </div>
                  <h3 className="font-bold text-white text-base">{e.aiSummary}</h3>
                  <p className="text-xs text-gray-300 line-clamp-2">{e.whatChanged}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {query && !loading && results.watches.length === 0 && results.events.length === 0 && (
          <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center space-y-3 font-mono">
            <FileText className="w-10 h-10 mx-auto text-gray-500" />
            <h3 className="text-base font-bold text-white">No Results Found</h3>
            <p className="text-xs text-gray-400">No watch targets or intelligence events match "{query}".</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center font-mono py-12 text-gray-400">Loading Search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
