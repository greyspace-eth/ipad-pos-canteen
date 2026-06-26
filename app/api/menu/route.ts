import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const items = await prisma.menuItem.findMany({
    orderBy: [{ cat: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, price, cat, imageUrl } = body;

  if (!name || typeof price !== 'number' || !cat) {
    return NextResponse.json({ error: 'name, price, and cat are required' }, { status: 400 });
  }

  const item = await prisma.menuItem.create({
    data: {
      name: String(name).trim(),
      price: Math.round(price), // already in cents
      cat: String(cat),
      imageUrl: imageUrl ?? null,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
