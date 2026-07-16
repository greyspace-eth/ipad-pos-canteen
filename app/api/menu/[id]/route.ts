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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { name, nameZh, price, cat, imageUrl, available, attachedGroupIds } = body;

  try {
    await prisma.menuItem.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(nameZh !== undefined && { nameZh: nameZh ? String(nameZh).trim() : null }),
        ...(price !== undefined && { price: Math.round(price) }),
        ...(cat !== undefined && { cat: String(cat) }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(available !== undefined && { available: Boolean(available) }),
      },
    });

    if (Array.isArray(attachedGroupIds)) {
      await prisma.menuItemModifierGroup.deleteMany({ where: { menuItemId: params.id } });
      if (attachedGroupIds.length > 0) {
        await prisma.menuItemModifierGroup.createMany({
          data: attachedGroupIds.map((gid: string, idx: number) => ({
            menuItemId: params.id,
            modifierGroupId: gid,
            sortOrder: idx,
          })),
        });
      }
    }

    const updated = await prisma.menuItem.findUnique({
      where: { id: params.id },
      include: includeModifiers,
    });
    return NextResponse.json(flattenItem(updated as unknown as Record<string, unknown>));
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
