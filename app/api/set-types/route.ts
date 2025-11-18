import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export async function GET() {
  const setTypes = await prisma.setType.findMany({
    orderBy: { id: "asc" },
    include: {
      _count: { select: { sets: true } }
    }
  });
  return NextResponse.json({ setTypes });
}
