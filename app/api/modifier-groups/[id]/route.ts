import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { name, required, singleSelect } = body;

  try {
    const group = await prisma.modifierGroup.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(required !== undefined && { required: Boolean(required) }),
        ...(singleSelect !== undefined && { singleSelect: Boolean(singleSelect) }),
      },
      include: { options: { orderBy: { sortOrder: 'asc' } } },
    });
    return NextResponse.json(group);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.modifierGroup.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
