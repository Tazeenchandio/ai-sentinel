import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { validateTargetUrl } from '@/lib/security/ssrf';

export async function GET() {
  const user = await getCurrentUser();
  const userId = user?.id;

  if (!userId) {
    // If unauthenticated in demo mode, fallback to demo user watches
    const demoUser = await db.user.findFirst({ where: { isDemo: true } });
    const watches = await db.watch.findMany({
      where: { userId: demoUser?.id },
      orderBy: { createdAt: 'desc' },
      include: { events: { take: 1, orderBy: { detectedAt: 'desc' } } },
    });
    return NextResponse.json({ watches });
  }

  const watches = await db.watch.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { events: { take: 1, orderBy: { detectedAt: 'desc' } } },
  });

  return NextResponse.json({ watches });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, description, type, target, checkIntervalMins, targetImportance, keywords, aiInstructions } = await req.json();

    if (!name || !type || !target) {
      return NextResponse.json({ error: 'Name, Watch Type, and Target are required.' }, { status: 400 });
    }

    // SSRF Check if website or RSS
    if (type === 'WEBSITE' || type === 'RSS_FEED') {
      const ssrfCheck = await validateTargetUrl(target);
      if (!ssrfCheck.allowed) {
        return NextResponse.json({ error: `SSRF Security Check Failed: ${ssrfCheck.reason}` }, { status: 400 });
      }
    }

    const newWatch = await db.watch.create({
      data: {
        userId: user.id,
        name,
        description,
        type,
        target,
        checkIntervalMins: Number(checkIntervalMins) || 60,
        targetImportance: targetImportance || 'MEDIUM',
        keywords: JSON.stringify(keywords || []),
        aiInstructions,
        status: 'ACTIVE',
        nextCheckAt: new Date(),
      },
    });

    return NextResponse.json({ watch: newWatch });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
