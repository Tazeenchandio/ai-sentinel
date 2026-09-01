'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Eye, Activity, Bell, Search, Settings, User, Radio, ExternalLink, Sparkles } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Command Center', href: '/dashboard', icon: Activity },
    { name: 'Intelligence Feed', href: '/feed', icon: Radio, badge: 'LIVE' },
    { name: 'Watch System', href: '/watches', icon: Eye },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Global Search', href: '/search', icon: Search },
  ];

  const bottomItems = [
    { name: 'Settings & Models', href: '/settings', icon: Settings },
    { name: 'User Profile', href: '/profile', icon: User },
  ];

  return (
    <aside className="w-64 glass-panel flex flex-col justify-between p-4 border-r border-white/10 hidden md:flex shrink-0 min-h-screen z-20">
      <div>
        <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-white/10">
          <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-glow">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wider flex items-center gap-2 font-mono">
              AI SENTINEL
            </h1>
            <span className="text-[10px] uppercase font-mono tracking-widest text-blue-400/90 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> 2030 PLATFORM
            </span>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-glow font-semibold'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-white/10 space-y-3">
        <nav className="space-y-1 mb-3">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <Link
          href="/demo"
          className="flex items-center justify-between px-3 py-2 text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl hover:bg-amber-500/20 transition"
        >
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            EXPLORE DEMO MODE
          </span>
          <ExternalLink className="w-3 h-3" />
        </Link>

        <div className="px-2 text-[11px] text-gray-500 font-mono flex items-center justify-between">
          <span>SYSTEM STATUS</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> ACTIVE
          </span>
        </div>
      </div>
    </aside>
  );
}
