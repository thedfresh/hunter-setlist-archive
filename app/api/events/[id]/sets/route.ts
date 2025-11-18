import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const eventId = Number(id);
  const sets = await prisma.set.findMany({
    where: { eventId },
    include: { setType: true },
    orderBy: { position: "asc" },
  });
  return NextResponse.json({ sets });
}
