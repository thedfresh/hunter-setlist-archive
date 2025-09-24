import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const eventId = Number(params.id);
  const sets = await prisma.set.findMany({
    where: { eventId },
    include: { setType: true },
    orderBy: { position: "asc" },
  });
  return NextResponse.json({ sets });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const eventId = Number(params.id);
  const data = await req.json();
  // Prevent duplicate position
  const exists = await prisma.set.findFirst({
    where: { eventId, position: data.position },
  });
  if (exists) {
    return NextResponse.json({ error: "Duplicate position in this event." }, { status: 400 });
  }
  const set = await prisma.set.create({
    data: {
      eventId,
      setTypeId: data.setTypeId,
      position: data.position,
      notes: data.notes,
    },
  });
  return NextResponse.json({ set }, { status: 201 });
}
