import { NextResponse } from 'next/server';
import { createSession, sessionCookieOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { pin } = await req.json();

  const correctPin = process.env.POS_PIN;
  if (!correctPin) {
    return NextResponse.json({ error: 'POS_PIN not configured' }, { status: 500 });
  }

  if (pin !== correctPin) {
    return NextResponse.json({ error: 'Wrong passcode' }, { status: 401 });
  }

  const token = await createSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookieOptions(token));
  return res;
}
