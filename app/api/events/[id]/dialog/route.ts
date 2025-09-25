import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Return all dialog for event
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

    // Get all dialog entries for those performances
    const performanceIds = performances.map((p) => p.id);
    const dialogs = await prisma.showDialog.findMany({
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

    // Sort dialogs by set position, then performance order
    dialogs.sort((a: any, b: any) => {
      const setA = a.performance.set?.position ?? 0;
      const setB = b.performance.set?.position ?? 0;
      if (setA !== setB) return setA - setB;
      return (a.performance.order ?? 0) - (b.performance.order ?? 0);
    });

    return NextResponse.json({ dialogs, performances });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch dialog" }, { status: 500 });
  }
}

// POST: Create new dialog
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
  }
  try {
    const body = await req.json();
    const { performanceId, isBeforeSong, isVerbatim, dialogText } = body;
    if (!performanceId || typeof dialogText !== "string") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const newDialog = await prisma.showDialog.create({
      data: {
        performanceId,
        isBeforeSong,
        isVerbatim,
        dialogText,
      },
    });
    return NextResponse.json(newDialog);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create dialog" }, { status: 500 });
  }
}
