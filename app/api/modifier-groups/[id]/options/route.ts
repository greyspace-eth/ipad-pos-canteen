import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { name, priceCents, isDefault } = body;
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });

  const count = await prisma.modifierOption.count({ where: { groupId: params.id } });
  const option = await prisma.modifierOption.create({
    data: {
      groupId: params.id,
      name: String(name).trim(),
      priceCents: Math.round(Number(priceCents) || 0),
      isDefault: Boolean(isDefault ?? false),
      sortOrder: count,
    },
  });
  return NextResponse.json(option, { status: 201 });
}
