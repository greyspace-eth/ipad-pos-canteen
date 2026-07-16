import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const groups = await prisma.modifierGroup.findMany({
    include: { options: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json(groups);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, required, singleSelect } = body;
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });

  const count = await prisma.modifierGroup.count();
  const group = await prisma.modifierGroup.create({
    data: {
      name: String(name).trim(),
      required: Boolean(required ?? false),
      singleSelect: Boolean(singleSelect ?? true),
      sortOrder: count,
    },
    include: { options: { orderBy: { sortOrder: 'asc' } } },
  });
  return NextResponse.json(group, { status: 201 });
}
