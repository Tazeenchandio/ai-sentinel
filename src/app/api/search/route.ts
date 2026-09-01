import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');

    if (!q || q.trim().length === 0) {
      return NextResponse.json({ watches: [], events: [] });
    }

    const user = await getCurrentUser();
    let userId = user?.id;
    if (!userId) {
      const demo = await db.user.findFirst({ where: { isDemo: true } });
      userId = demo?.id;
    }

    const [watches, events] = await Promise.all([
      db.watch.findMany({
        where: {
          ...(userId && { userId }),
          OR: [
            { name: { contains: q } },
            { target: { contains: q } },
            { aiInstructions: { contains: q } },
          ],
        },
        take: 10,
      }),
      db.changeEvent.findMany({
        where: {
          ...(userId && { watch: { userId } }),
          OR: [
            { aiSummary: { contains: q } },
            { whatChanged: { contains: q } },
            { whyItMatters: { contains: q } },
          ],
        },
        take: 10,
        include: { watch: { select: { name: true, target: true } } },
      }),
    ]);

    return NextResponse.json({ watches: watches || [], events: events || [] });
  } catch (err: any) {
    return NextResponse.json({ watches: [], events: [] });
  }
}
