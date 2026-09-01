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

  const notifications = await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 30,
    include: { event: { select: { id: true, watchId: true, importance: true } } },
  });

  return NextResponse.json({ notifications });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, markAllRead } = await req.json();
    if (markAllRead) {
      await db.notification.updateMany({
        where: { userId: user.id },
        data: { isRead: true },
      });
    } else if (id) {
      await db.notification.update({
        where: { id },
        data: { isRead: true },
      });
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
