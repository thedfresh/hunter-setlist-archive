import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ setId: string }> }) {
  const { setId: setIdParam } = await params;
  const setId = Number(setIdParam);
  const performances = await prisma.performance.findMany({
    where: { setId },
    include: {
      song: true,
      performanceMusicians: {
        include: { musician: true, instrument: true },
      },
      leadVocals: true,
    },
    orderBy: { performanceOrder: "asc" },
  });
  return NextResponse.json({ performances });
}
