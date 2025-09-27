import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT: Update banter
export async function PUT(req: NextRequest, { params }: { params: { id: string; banterId: string } }) {
  const { id, banterId } = params;
  if (!id || isNaN(Number(id)) || !banterId || isNaN(Number(banterId))) {
    return NextResponse.json({ error: "Invalid event id or banterId" }, { status: 400 });
  }
  try {
    // Fetch banter with performance.set included
    const banter = await prisma.showBanter.findUnique({
      where: { id: parseInt(banterId) },
      include: { performance: { include: { set: true } } },
    });
    if (!banter || banter.performance.set.eventId !== parseInt(id)) {
      return NextResponse.json({ error: "Banter not found for event" }, { status: 404 });
    }
    const body = await req.json();
    const { banterText, isBeforeSong } = body;
    // Always coerce isVerbatim to boolean
    const isVerbatim = typeof body.isVerbatim === "boolean" ? body.isVerbatim : !!body.isVerbatim;
    const updatedBanter = await prisma.showBanter.update({
      where: { id: parseInt(banterId) },
      data: { banterText, isBeforeSong, isVerbatim },
    });
    return NextResponse.json(updatedBanter);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update banter" }, { status: 500 });
  }
}

// DELETE: Remove banter
export async function DELETE(req: NextRequest, { params }: { params: { id: string; banterId: string } }) {
  const { id, banterId } = params;
  if (!id || isNaN(Number(id)) || !banterId || isNaN(Number(banterId))) {
    return NextResponse.json({ error: "Invalid event id or banterId" }, { status: 400 });
  }
  try {
    // Fetch banter with performance.set included
    const banter = await prisma.showBanter.findUnique({
      where: { id: parseInt(banterId) },
      include: { performance: { include: { set: true } } },
    });
    if (!banter || banter.performance.set.eventId !== parseInt(id)) {
      return NextResponse.json({ error: "Banter not found for event" }, { status: 404 });
    }
    await prisma.showBanter.delete({ where: { id: parseInt(banterId) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete banter" }, { status: 500 });
  }
}
