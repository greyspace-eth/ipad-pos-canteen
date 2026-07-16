import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
  const { totalCents, payment, staffDiscount, items } = body;

  if (!totalCents || !payment || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Invalid order payload' }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: {
      totalCents: Math.round(totalCents),
      payment: String(payment),
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
