'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCircle2, Shield, ArrowUpRight, CheckCheck, RefreshCw } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between glass-panel p-6 rounded-2xl border border-white/10 shadow-glow">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 font-mono">
            <Bell className="w-6 h-6 text-blue-400" />
            Alert & Notification Center
          </h1>
          <p className="text-xs text-gray-400 font-mono">Real-time alerts triggered by priority change events</p>
        </div>

        <button
          onClick={fetchNotifications}
          className="p-2.5 rounded-xl glass-panel hover:bg-white/10 text-gray-300 transition border border-white/10 text-xs font-mono flex items-center gap-1.5"
        >
          <RefreshCw className={'w-4 h-4 ' + (loading ? 'animate-spin' : '')} />
          <span>Refresh</span>
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center space-y-4 font-mono">
          <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
          <h3 className="text-lg font-bold text-white">No New Notifications</h3>
          <p className="text-xs text-gray-400">All alerts have been reviewed. Sentinel is actively monitoring in the background.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={
                'glass-panel p-5 rounded-2xl border transition ' +
                (notif.severity === 'CRITICAL'
                  ? 'border-red-500/30 bg-red-500/5'
                  : notif.severity === 'HIGH'
                  ? 'border-orange-500/30 bg-orange-500/5'
                  : 'border-white/10')
              }
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={
                      'px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ' +
                      (notif.severity === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30')
                    }
                  >
                    {notif.severity}
                  </span>
                  <span className="text-sm font-bold text-white">{notif.title}</span>
                </div>
                <span className="text-[11px] font-mono text-gray-500">
                  {new Date(notif.createdAt).toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-gray-300 mb-3">{notif.message}</p>

              {notif.eventId && (
                <div className="flex justify-end">
                  <Link
                    href={'/events/' + notif.eventId}
                    className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold"
                  >
                    Investigate Event <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
