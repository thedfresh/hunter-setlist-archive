import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Return all banter for event
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
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

// POST: Create new banter
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
  }
  try {
    const body = await req.json();
    const { performanceId, isBeforeSong, isVerbatim, banterText } = body;
    if (!performanceId || typeof banterText !== "string") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const newBanter = await prisma.showBanter.create({
      data: {
        performanceId,
        isBeforeSong,
        isVerbatim,
        banterText,
      },
    });
    return NextResponse.json(newBanter);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create banter" }, { status: 500 });
  }
}
