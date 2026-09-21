import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const order = await req.json();

  await redis.lpush('print-jobs', JSON.stringify({ ...order, at: new Date().toISOString() }));

  return NextResponse.json({ queued: true }, { status: 201 });
}
