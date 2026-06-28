import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.order.update({
    where: { id: params.id },
    data: { deletedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
