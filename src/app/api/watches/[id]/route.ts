import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const watch = await db.watch.findUnique({
    where: { id: params.id },
    include: {
      snapshots: { orderBy: { createdAt: 'desc' }, take: 5 },
      events: { orderBy: { detectedAt: 'desc' }, take: 10 },
      jobs: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  });

  if (!watch) {
    return NextResponse.json({ error: 'Watch not found.' }, { status: 404 });
  }

  return NextResponse.json({ watch });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const updated = await db.watch.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.status && { status: body.status }),
        ...(body.checkIntervalMins && { checkIntervalMins: Number(body.checkIntervalMins) }),
        ...(body.targetImportance && { targetImportance: body.targetImportance }),
        ...(body.aiInstructions !== undefined && { aiInstructions: body.aiInstructions }),
        ...(body.keywords && { keywords: JSON.stringify(body.keywords) }),
      },
    });
    return NextResponse.json({ watch: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await db.watch.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
