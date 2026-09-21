import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

// Daily order number, reset at midnight Singapore time — the Redis key itself
// changes at midnight SGT, so no separate reset job is needed.
async function nextOrderNo(): Promise<string> {
  const sgtDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Singapore' }); // "YYYY-MM-DD"
  const key = `order-seq:${sgtDate}`;
  try {
    const seq = await redis.incr(key);
    if (seq === 1) await redis.expire(key, 60 * 60 * 24 * 2); // tidy up after 2 days
    return String(seq).padStart(3, '0');
  } catch {
    return '000'; // Redis unavailable — don't block checkout over a receipt number
  }
}

export async function GET() {
  const orders = await prisma.order.findMany({
    where: { deletedAt: null },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { totalCents, payment, orderType, staffDiscount, items } = body;

  if (!totalCents || !payment || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Invalid order payload' }, { status: 400 });
  }

  const orderNo = await nextOrderNo();

  const order = await prisma.order.create({
    data: {
      orderNo,
      totalCents: Math.round(totalCents),
      payment: String(payment),
      orderType: orderType === 'takeaway' ? 'takeaway' : 'dine_in',
      staffDiscount: Boolean(staffDiscount),
      items: {
        create: items.map((i: {
          menuItemId?: string;
          name: string;
          quantity: number;
          unitCents: number;
          modifiers?: { optionId: string; optionName: string; priceCents: number }[];
        }) => ({
          menuItemId: i.menuItemId ?? null,
          name: String(i.name),
          quantity: Number(i.quantity),
          unitCents: Math.round(i.unitCents),
          modifiers: i.modifiers?.length ? JSON.stringify(i.modifiers) : null,
        })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json(order, { status: 201 });
}
