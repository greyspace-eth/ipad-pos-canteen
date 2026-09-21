import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { queuePrintJob } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  await queuePrintJob({
    type: 'receipt',
    orderNo: order.orderNo,
    mode: order.orderType === 'takeaway' ? 'TAKEAWAY' : 'DINE-IN',
    items: order.items.map((i) => {
      let modifiers: string[] = [];
      if (i.modifiers) {
        try {
          modifiers = (JSON.parse(i.modifiers) as { optionName: string }[]).map((m) => m.optionName);
        } catch { /* ignore malformed modifier snapshot */ }
      }
      return { qty: i.quantity, name: i.name, total: (i.unitCents * i.quantity) / 100, modifiers };
    }),
    total: order.totalCents / 100,
    payment: order.payment === 'cash' ? 'CASH' : 'PAYNOW',
    cashReceived: order.cashReceivedCents != null ? order.cashReceivedCents / 100 : undefined,
    cashier: 'admin',
    reprint: true,
  });

  return NextResponse.json({ queued: true }, { status: 201 });
}
