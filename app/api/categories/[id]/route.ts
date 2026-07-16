import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const cat = await prisma.category.findUnique({ where: { id: params.id } });
  if (!cat) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (cat.system) return NextResponse.json({ error: 'Cannot delete system category' }, { status: 403 });

  // Move items in this category to Others
  const others = await prisma.category.findFirst({ where: { name: 'Others' } });
  if (others && others.name !== cat.name) {
    await prisma.menuItem.updateMany({
      where: { cat: cat.name },
      data: { cat: others.name },
    });
  }

  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
