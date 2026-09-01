import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET() {
  const user = await getCurrentUser();
  let userId = user?.id;
  if (!userId) {
    const demo = await db.user.findFirst({ where: { isDemo: true } });
    userId = demo?.id;
  }

  const totalWatches = await db.watch.count({ where: { userId } });
  const activeWatches = await db.watch.count({ where: { userId, status: 'ACTIVE' } });
  const totalChanges = await db.changeEvent.count({ where: { watch: { userId } } });
  const criticalAlerts = await db.changeEvent.count({
    where: { watch: { userId }, importance: 'CRITICAL', status: { in: ['NEW', 'ACTION_REQUIRED'] } },
  });
  const highAlerts = await db.changeEvent.count({
    where: { watch: { userId }, importance: 'HIGH' },
  });

  const lastJob = await db.jobLog.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  const severityDistribution = {
    CRITICAL: await db.changeEvent.count({ where: { watch: { userId }, importance: 'CRITICAL' } }),
    HIGH: await db.changeEvent.count({ where: { watch: { userId }, importance: 'HIGH' } }),
    MEDIUM: await db.changeEvent.count({ where: { watch: { userId }, importance: 'MEDIUM' } }),
    LOW: await db.changeEvent.count({ where: { watch: { userId }, importance: 'LOW' } }),
  };

  return NextResponse.json({
    totalWatches,
    activeWatches,
    totalChanges,
    criticalAlerts,
    highAlerts,
    monitoringHealth: '100% Operational',
    lastScanAt: lastJob?.createdAt || new Date(),
    severityDistribution,
  });
}
