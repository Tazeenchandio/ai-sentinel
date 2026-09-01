import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() || '';

  if (!q) {
    return NextResponse.json({ watches: [], events: [] });
  }

  const user = await getCurrentUser();
  let userId = user?.id;
  if (!userId) {
    const demo = await db.user.findFirst({ where: { isDemo: true } });
    userId = demo?.id;
  }

  const watches = await db.watch.findMany({
    where: {
      userId,
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
        { target: { contains: q } },
        { keywords: { contains: q } },
      ],
    },
    take: 10,
  });

  const events = await db.changeEvent.findMany({
    where: {
      watch: { userId },
      OR: [
        { whatChanged: { contains: q } },
        { whyItMatters: { contains: q } },
        { aiSummary: { contains: q } },
        { category: { contains: q } },
      ],
    },
    take: 10,
    include: { watch: { select: { id: true, name: true, type: true } } },
  });

  return NextResponse.json({ watches, events });
}
