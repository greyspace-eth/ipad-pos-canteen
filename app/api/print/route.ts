import { NextResponse } from 'next/server';
import { queuePrintJob } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const order = await req.json();

  await queuePrintJob(order);

  return NextResponse.json({ queued: true }, { status: 201 });
}
