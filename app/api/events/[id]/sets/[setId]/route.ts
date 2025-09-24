import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: { id: string; setId: string } }) {
  const eventId = Number(params.id);
  const setId = Number(params.setId);
  const data = await req.json();
  // Prevent duplicate position
  const exists = await prisma.set.findFirst({
    where: { eventId, position: data.position, NOT: { id: setId } },
  });
  if (exists) {
    return NextResponse.json({ error: "Duplicate position in this event." }, { status: 400 });
  }
  const set = await prisma.set.update({
    where: { id: setId },
    data: {
      setTypeId: data.setTypeId,
      position: data.position,
      notes: data.notes,
    },
  });
  return NextResponse.json({ set });
}

export async function DELETE(req: Request, { params }: { params: { id: string; setId: string } }) {
  const setId = Number(params.setId);
  await prisma.set.delete({ where: { id: setId } });
  return NextResponse.json({ success: true });
}
