import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';

// GET: Return all banter for event
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
  }
  try {
    // Get all performances for the event, with song and set info
    const performances = await prisma.performance.findMany({
      where: { set: { eventId: parseInt(id) } },
      include: {
        song: true,
        set: true,
      },
    });

    // Get all banter entries for those performances
    const performanceIds = performances.map((p) => p.id);
    const banter = await prisma.showBanter.findMany({
      where: { performanceId: { in: performanceIds } },
      include: {
        performance: {
          include: {
            song: true,
            set: true,
          },
        },
      },
    });

    // Sort banter by set position, then performance order
    banter.sort((a: any, b: any) => {
      const setA = a.performance.set?.position ?? 0;
      const setB = b.performance.set?.position ?? 0;
      if (setA !== setB) return setA - setB;
      return (a.performance.order ?? 0) - (b.performance.order ?? 0);
    });

    return NextResponse.json({ banter, performances });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch banter" }, { status: 500 });
  }
}
