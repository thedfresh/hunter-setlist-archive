// ...existing code...
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Return all dialog for event
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
  }
  try {
    // Step 1: Get performance IDs for the event
    const performances = await prisma.performance.findMany({
  where: { set: { eventId: parseInt(id) } },
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

// PUT: Update dialog
export async function PUT(req: NextRequest, { params }: { params: { eventId: string; dialogId: string } }) {
  const { eventId, dialogId } = params;
  if (!eventId || isNaN(Number(eventId)) || !dialogId || isNaN(Number(dialogId))) {
    return NextResponse.json({ error: "Invalid eventId or dialogId" }, { status: 400 });
  }
  try {
    // Fetch dialog with performance.set included
    const dialog = await prisma.showDialog.findUnique({
      where: { id: parseInt(dialogId) },
      include: { performance: { include: { set: true } } },
    });
    if (!dialog || dialog.performance.set.eventId !== parseInt(eventId)) {
      return NextResponse.json({ error: "Dialog not found for event" }, { status: 404 });
    }
    const body = await req.json();
    const { dialogText, isBeforeSong, isVerbatim } = body;
    const updatedDialog = await prisma.showDialog.update({
      where: { id: parseInt(dialogId) },
      data: { dialogText, isBeforeSong, isVerbatim },
    });
    return NextResponse.json(updatedDialog);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update dialog" }, { status: 500 });
  }
}

// DELETE: Remove dialog
export async function DELETE(req: NextRequest, { params }: { params: { eventId: string; dialogId: string } }) {
  const { eventId, dialogId } = params;
  if (!eventId || isNaN(Number(eventId)) || !dialogId || isNaN(Number(dialogId))) {
    return NextResponse.json({ error: "Invalid eventId or dialogId" }, { status: 400 });
  }
  try {
    // Fetch dialog with performance.set included
    const dialog = await prisma.showDialog.findUnique({
      where: { id: parseInt(dialogId) },
      include: { performance: { include: { set: true } } },
    });
    if (!dialog || dialog.performance.set.eventId !== parseInt(eventId)) {
      return NextResponse.json({ error: "Dialog not found for event" }, { status: 404 });
    }
    await prisma.showDialog.delete({ where: { id: parseInt(dialogId) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete dialog" }, { status: 500 });
  }
}
