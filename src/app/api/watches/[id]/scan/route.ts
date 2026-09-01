import { NextResponse } from 'next/server';
import { executeWatchScan } from '@/lib/worker/scan.job';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const result = await executeWatchScan(params.id);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
