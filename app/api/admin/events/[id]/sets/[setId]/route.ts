import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from 'next/cache';

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
      setType: { connect: { id: Number(data.setTypeId) } },
      position: data.position,
      publicNotes: data.notes,
      isUncertain: data.isUncertain ?? false,
      band: data.bandId ? { connect: { id: data.bandId } } : { disconnect: true },
    },
  });
  revalidatePath('/api/events');
  revalidatePath('/event');
  return NextResponse.json({ set });
}

export async function DELETE(req: Request, { params }: { params: { id: string; setId: string } }) {
  const setId = Number(params.setId);
  await prisma.set.delete({ where: { id: setId } });
  revalidatePath('/api/events');
  revalidatePath('/event');
  return NextResponse.json({ success: true });
}
