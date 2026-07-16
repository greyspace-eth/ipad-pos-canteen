import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const includeModifiers = {
  modifierGroups: {
    include: {
      modifierGroup: {
        include: { options: { orderBy: { sortOrder: 'asc' as const } } },
      },
    },
    orderBy: { sortOrder: 'asc' as const },
  },
};

function flattenItem(item: Record<string, unknown>) {
  const mgs = (item.modifierGroups as { modifierGroup: unknown; sortOrder: number }[]) ?? [];
  return {
    ...item,
    modifierGroups: mgs
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((mg) => mg.modifierGroup),
  };
}

export async function GET() {
  const items = await prisma.menuItem.findMany({
    include: includeModifiers,
    orderBy: [{ cat: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json(items.map(flattenItem));
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, nameZh, price, cat, imageUrl, attachedGroupIds } = body;

  if (!name || typeof price !== 'number' || !cat) {
    return NextResponse.json({ error: 'name, price, and cat are required' }, { status: 400 });
  }

  const item = await prisma.menuItem.create({
    data: {
      name: String(name).trim(),
      nameZh: nameZh ? String(nameZh).trim() : null,
      price: Math.round(price),
      cat: String(cat),
      imageUrl: imageUrl ?? null,
      ...(Array.isArray(attachedGroupIds) && attachedGroupIds.length > 0 && {
        modifierGroups: {
          create: attachedGroupIds.map((gid: string, idx: number) => ({
            modifierGroupId: gid,
            sortOrder: idx,
          })),
        },
      }),
    },
    include: includeModifiers,
  });

  return NextResponse.json(flattenItem(item as unknown as Record<string, unknown>), { status: 201 });
}
