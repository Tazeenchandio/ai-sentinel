'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Bell, Search, Shield, LogOut, Plus, ChevronDown, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (data.notifications) {
          const unread = data.notifications.filter((n: any) => !n.isRead).length;
          setUnreadCount(unread);
        }
      })
      .catch(() => {});

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
    <header className="h-16 glass-panel border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-6">
        {/* Mobile Logo */}
        <Link href="/dashboard" className="md:hidden flex items-center gap-2 font-bold text-white">
          <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-mono text-sm tracking-wider">SENTINEL</span>
        </Link>

        {/* Workspace Switcher */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-300">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          <span className="font-semibold text-white">Personal Workspace</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
        </div>

        {/* System Operational Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>SYSTEM 100% NOMINAL • CLAUDE 3.5 ACTIVE</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search monitors, diffs, AI summaries... [⌘K]"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                router.push('/search?q=' + encodeURIComponent((e.target as HTMLInputElement).value));
              }
            }}
            className="w-72 bg-white/5 text-xs rounded-xl pl-9 pr-4 py-2 border border-white/10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-500 text-white font-sans"
          />
        </div>

        <Link
          href="/watches/create"
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white transition shadow-glow"
        >
          <Plus className="w-4 h-4" />
          New Watch Target
        </Link>

        {/* Notifications Icon with Badge */}
        <Link href="/notifications" className="relative p-2 text-gray-300 hover:text-white rounded-xl hover:bg-white/5 transition" title="Notification Center">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* User Profile Info */}
        <div className="flex items-center gap-3 pl-3 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-white">{user?.name || 'Alex Vance'}</p>
            <p className="text-[10px] font-mono text-blue-400">{user?.role || 'LEAD ARCHITECT'}</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-blue-400 text-xs font-bold font-mono">
            {(user?.name || 'AV').substring(0, 2).toUpperCase()}
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 text-gray-400 hover:text-red-400 rounded-xl hover:bg-white/5 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
