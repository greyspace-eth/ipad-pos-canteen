import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { name, price, cat, imageUrl, available } = body;

  try {
    const item = await prisma.menuItem.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(price !== undefined && { price: Math.round(price) }),
        ...(cat !== undefined && { cat: String(cat) }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(available !== undefined && { available: Boolean(available) }),
      },
    });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.menuItem.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }
}
