'use client';
import { useEffect, useState } from 'react';
import { User, Shield, Key, Database, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-glow">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 font-mono">
          <User className="w-6 h-6 text-blue-400" />
          Operator Profile
        </h1>
        <p className="text-xs text-gray-400 font-mono">Session and access credentials for Sentinel platform</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
        <div className="flex items-center gap-4 border-b border-white/10 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-blue-400 text-xl font-bold font-mono">
            {(user?.name || 'AV').substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name || 'Alex Vance'}</h2>
            <p className="text-xs font-mono text-gray-400">{user?.email || 'demo@sentinel.dev'}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase">
              {user?.role || 'LEAD ARCHITECT'}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-gray-400 block">WORKSPACE ID</span>
            <span className="text-white font-bold">{user?.id || 'ws_sentinel_primary_01'}</span>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-gray-400 block">ENCRYPTION PROTOCOL</span>
            <span className="text-emerald-400 font-bold">HMAC-SHA256 JWT (HttpOnly)</span>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-mono text-xs font-bold transition flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            End Session
          </button>
        </div>
      </div>
    </div>
  );
}
