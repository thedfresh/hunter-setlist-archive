import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export async function POST(req: Request, { params }: { params: { setId: string } }) {
  const setId = Number(params.setId);
  try {
    const data = await req.json();
    if (!data.musicianId) {
      return NextResponse.json({ error: "musicianId required" }, { status: 400 });
    }
    const setMusician = await prisma.setMusician.create({
      data: {
        setId,
        musicianId: Number(data.musicianId),
        instrumentId: data.instrumentId ? Number(data.instrumentId) : null,
        publicNotes: data.publicNotes || null,
        privateNotes: data.privateNotes || null,
      },
      include: {
        musician: true,
        instrument: true,
      },
    });
    return NextResponse.json({ musician: setMusician }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create set musician." }, { status: 500 });
  }
}
