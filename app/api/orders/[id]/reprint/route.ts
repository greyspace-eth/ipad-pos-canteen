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
    include: { items: { include: { menuItem: true } } },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  function parseModifiers(raw: string | null): string[] {
    if (!raw) return [];
    try {
      return (JSON.parse(raw) as { optionName: string }[]).map((m) => m.optionName);
    } catch {
      return [];
    }
  }

  // Staff Price is excluded here (and totaled separately below) so SUBTOTAL on the printed
  // receipt reflects the food/drink total before any staff discount — same reasoning as the
  // live checkout receipt. Math.abs covers orders recorded before unitCents was sign-corrected.
  const staffItems = order.items.filter((i) => i.menuItem?.cat === 'Staff Price');
  const staffDiscountCents = staffItems.reduce((a, i) => a + Math.abs(i.unitCents * i.quantity), 0);

  await queuePrintJob({
    type: 'receipt',
    orderNo: order.orderNo,
    mode: order.orderType === 'takeaway' ? 'TAKEAWAY' : 'DINE-IN',
    items: order.items
      .filter((i) => i.menuItem?.cat !== 'Staff Price')
      .map((i) => ({
        qty: i.quantity,
        name: i.name,
        total: (i.unitCents * i.quantity) / 100,
        modifiers: parseModifiers(i.modifiers),
      })),
    staffDiscount: staffDiscountCents > 0 ? staffDiscountCents / 100 : undefined,
    total: order.totalCents / 100,
    payment: order.payment === 'cash' ? 'CASH' : 'PAYNOW',
    cashReceived: order.cashReceivedCents != null ? order.cashReceivedCents / 100 : undefined,
    cashier: 'admin',
    reprint: true,
  });

  return NextResponse.json({ queued: true }, { status: 201 });
}
