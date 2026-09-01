import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const event = await db.changeEvent.findUnique({
    where: { id: params.id },
    include: {
      watch: true,
      aiAnalyses: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  if (!event) {
    return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
  }

  return NextResponse.json({ event });
}
