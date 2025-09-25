import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT: Update dialog
export async function PUT(req: NextRequest, { params }: { params: { id: string; dialogId: string } }) {
  const { id, dialogId } = params;
  if (!id || isNaN(Number(id)) || !dialogId || isNaN(Number(dialogId))) {
    return NextResponse.json({ error: "Invalid event id or dialogId" }, { status: 400 });
  }
  try {
    // Fetch dialog with performance.set included
    const dialog = await prisma.showDialog.findUnique({
      where: { id: parseInt(dialogId) },
      include: { performance: { include: { set: true } } },
    });
    if (!dialog || dialog.performance.set.eventId !== parseInt(id)) {
      return NextResponse.json({ error: "Dialog not found for event" }, { status: 404 });
    }
    const body = await req.json();
    const { dialogText, isBeforeSong } = body;
    // Always coerce isVerbatim to boolean
    const isVerbatim = typeof body.isVerbatim === "boolean" ? body.isVerbatim : !!body.isVerbatim;
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
export async function DELETE(req: NextRequest, { params }: { params: { id: string; dialogId: string } }) {
  const { id, dialogId } = params;
  if (!id || isNaN(Number(id)) || !dialogId || isNaN(Number(dialogId))) {
    return NextResponse.json({ error: "Invalid event id or dialogId" }, { status: 400 });
  }
  try {
    // Fetch dialog with performance.set included
    const dialog = await prisma.showDialog.findUnique({
      where: { id: parseInt(dialogId) },
      include: { performance: { include: { set: true } } },
    });
    if (!dialog || dialog.performance.set.eventId !== parseInt(id)) {
      return NextResponse.json({ error: "Dialog not found for event" }, { status: 404 });
    }
    await prisma.showDialog.delete({ where: { id: parseInt(dialogId) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete dialog" }, { status: 500 });
  }
}
