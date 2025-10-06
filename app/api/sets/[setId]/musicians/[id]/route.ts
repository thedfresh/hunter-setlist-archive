import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: { setId: string; id: string } }) {
  const setMusicianId = Number(params.id);
  try {
    const data = await req.json();
    const updated = await prisma.setMusician.update({
      where: { id: setMusicianId },
      data: {
        musicianId: data.musicianId ? Number(data.musicianId) : undefined,
        instrumentId: data.instrumentId ? Number(data.instrumentId) : null,
        publicNotes: data.publicNotes ?? null,
        privateNotes: data.privateNotes ?? null,
      },
      include: {
        musician: true,
        instrument: true,
      },
    });
    return NextResponse.json({ musician: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update set musician." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { setId: string; id: string } }) {
  const setMusicianId = Number(params.id);
  try {
    await prisma.setMusician.delete({ where: { id: setMusicianId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete set musician." }, { status: 500 });
  }
}
