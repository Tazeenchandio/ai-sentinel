import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { validateTargetUrl } from '@/lib/security/ssrf';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    let userId = user?.id;
    if (!userId) {
      const demo = await db.user.findFirst({ where: { isDemo: true } });
      userId = demo?.id;
    }

    const watches = await db.watch.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { events: true } },
      },
    });

    return NextResponse.json({ watches: watches || [] });
  } catch (err: any) {
    return NextResponse.json({ watches: [] });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    let userId = user?.id;
    if (!userId) {
      const demo = await db.user.findFirst({ where: { isDemo: true } });
      userId = demo?.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, type, target, checkIntervalMins, targetImportance, keywords, aiInstructions } = body;

    if (!name || !type || !target) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (type === 'WEBSITE' || type === 'RSS_FEED') {
      const ssrfCheck = await validateTargetUrl(target);
      if (!ssrfCheck.allowed) {
        return NextResponse.json({ error: `Security Policy: ${ssrfCheck.reason}` }, { status: 400 });
      }
    }

    const watch = await db.watch.create({
      data: {
        userId,
        name,
        type,
        target,
        checkIntervalMins: checkIntervalMins || 60,
        targetImportance: targetImportance || 'HIGH',
        keywords: keywords ? JSON.stringify(keywords) : '[]',
        aiInstructions: aiInstructions || null,
        nextCheckAt: new Date(),
      },
    });

    return NextResponse.json({ watch }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
