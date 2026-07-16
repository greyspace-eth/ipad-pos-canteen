import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { name, priceCents, isDefault } = body;

  try {
    const option = await prisma.modifierOption.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(priceCents !== undefined && { priceCents: Math.round(Number(priceCents)) }),
        ...(isDefault !== undefined && { isDefault: Boolean(isDefault) }),
      },
    });
    return NextResponse.json(option);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.modifierOption.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
