import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const DEFAULTS = [
  { name: 'Staff Price', sortOrder: 0, system: true },
  { name: 'Fixed Price', sortOrder: 1, system: false },
  { name: 'Custom',      sortOrder: 2, system: false },
  { name: 'Others',      sortOrder: 3, system: false },
];

export async function GET() {
  let cats = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  if (cats.length === 0) {
    await prisma.category.createMany({ data: DEFAULTS });
    cats = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  }
  return NextResponse.json(cats);
}

export async function POST(req: Request) {
  const { name } = await req.json();
  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 });
  }
  const maxOrder = await prisma.category.aggregate({ _max: { sortOrder: true } });
  const cat = await prisma.category.create({
    data: { name: name.trim(), sortOrder: (maxOrder._max.sortOrder ?? 3) + 1 },
  });
  return NextResponse.json(cat, { status: 201 });
}
