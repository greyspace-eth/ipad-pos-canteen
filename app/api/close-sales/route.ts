import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const closings = await prisma.dailyClosing.findMany({
    orderBy: { closedAt: 'desc' },
    take: 90,
  });
  return NextResponse.json(closings);
}

export async function POST() {
  const openOrders = await prisma.order.findMany({
    where: { deletedAt: null, closedAt: null },
  });

  if (openOrders.length === 0) {
    return NextResponse.json({ error: 'No open orders to close' }, { status: 400 });
  }

  const completed = openOrders.filter((o) => o.status === 'completed');
  const periodStart = openOrders.reduce(
    (min, o) => (o.createdAt < min ? o.createdAt : min),
    openOrders[0].createdAt
  );

  const closing = await prisma.$transaction(async (tx) => {
    const created = await tx.dailyClosing.create({
      data: {
        periodStart,
        orderCount: completed.length,
        totalCents: completed.reduce((a, o) => a + o.totalCents, 0),
        cashCents: completed.filter((o) => o.payment === 'cash').reduce((a, o) => a + o.totalCents, 0),
        paynowCents: completed.filter((o) => o.payment === 'paynow').reduce((a, o) => a + o.totalCents, 0),
        voidedCount: openOrders.filter((o) => o.status === 'voided').length,
        refundedCount: openOrders.filter((o) => o.status === 'refunded').length,
      },
    });

    await tx.order.updateMany({
      where: { id: { in: openOrders.map((o) => o.id) } },
      data: { closedAt: created.closedAt },
    });

    return created;
  });

  return NextResponse.json(closing, { status: 201 });
}
