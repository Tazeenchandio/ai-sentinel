import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const importance = searchParams.get('importance');
  const watchId = searchParams.get('watchId');
  const category = searchParams.get('category');
  const status = searchParams.get('status');

  const user = await getCurrentUser();
  let userId = user?.id;
  if (!userId) {
    const demo = await db.user.findFirst({ where: { isDemo: true } });
    userId = demo?.id;
  }

  const whereClause: any = {
    watch: { userId },
    isMeaningful: true,
    ...(importance && { importance }),
    ...(watchId && { watchId }),
    ...(category && { category }),
    ...(status && { status }),
  };

  const events = await db.changeEvent.findMany({
    where: whereClause,
    orderBy: { detectedAt: 'desc' },
    include: {
      watch: { select: { id: true, name: true, type: true, target: true } },
    },
  });

  return NextResponse.json({ events });
}
