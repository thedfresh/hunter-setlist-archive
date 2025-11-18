import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from 'next/cache';

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
        publicNotes: data.publicNotes || null,
        privateNotes: data.privateNotes || null,
        instruments: {
          create: (data.instrumentIds || []).map((instId: number) => ({
            instrumentId: instId
          }))
        }
      },
      include: {
        musician: true,
        instruments: {
          include: {
            instrument: true
          }
        }
      },
    });
    revalidatePath('/admin/events');
    revalidatePath('/event', 'page');
    return NextResponse.json({ musician: setMusician }, { status: 201 });
  } catch (error) {
    console.error('SetMusician create error:', error);
    return NextResponse.json({ error: "Failed to create set musician." }, { status: 500 });
  }
}