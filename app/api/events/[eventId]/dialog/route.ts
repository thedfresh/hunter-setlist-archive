// ...existing code...
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Return all dialog for event
export async function GET(req: NextRequest, { params }: { params: { eventId: string } }) {
  const eventId = params.eventId;
  if (!eventId || isNaN(Number(eventId))) {
    return NextResponse.json({ error: "Invalid eventId" }, { status: 400 });
  }
  try {
    // Step 1: Get performance IDs for the event
    const performances = await prisma.performance.findMany({
      where: { set: { eventId: parseInt(eventId) } },
      select: { id: true, set: { select: { position: true } } },
    });
  const performanceIds = performances.map((p: { id: number }) => p.id);

    // Step 2: Get dialog for those performances
    const dialog = await prisma.showDialog.findMany({
      where: { performanceId: { in: performanceIds } },
      include: {
        performance: {
          include: {
            song: true,
            set: { select: { position: true } },
          },
        },
      },
    });

    // Sort dialog by set position, then performance order
    dialog.sort((a: any, b: any) => {
      const setA = a.performance.set?.position ?? 0;
      const setB = b.performance.set?.position ?? 0;
      if (setA !== setB) return setA - setB;
      return (a.performance.order ?? 0) - (b.performance.order ?? 0);
    });

    return NextResponse.json(dialog);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch dialog" }, { status: 500 });
  }
}

// POST: Create new dialog
export async function POST(req: NextRequest, { params }: { params: { eventId: string } }) {
  const eventId = params.eventId;
  if (!eventId || isNaN(Number(eventId))) {
    return NextResponse.json({ error: "Invalid eventId" }, { status: 400 });
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
