import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    let userId = user?.id;
    if (!userId) {
      const demo = await db.user.findFirst({ where: { isDemo: true } });
      userId = demo?.id;
    }

    const notifications = await db.notification.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        event: {
          include: { watch: { select: { name: true, target: true } } },
        },
      },
    });

    return NextResponse.json({ notifications: notifications || [] });
  } catch (err: any) {
    return NextResponse.json({ notifications: [] });
  }
}
