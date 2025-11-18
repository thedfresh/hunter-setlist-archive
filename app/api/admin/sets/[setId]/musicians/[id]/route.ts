import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateAll } from '@/lib/utils/revalidation';

export async function GET(_req: Request, { params }: { params: { setId: string; id: string } }) {
  const musicianId = Number(params.id);
  const setId = Number(params.setId);
  try {
    const setMusician = await prisma.setMusician.findFirst({
      where: { setId, musicianId },
      include: {
        musician: true,
        instruments: {
          include: {
            instrument: { select: { id: true, displayName: true } }
          }
        }
      }
    });
    if (!setMusician) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(setMusician);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch set musician." }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { setId: string; id: string } }) {
  const musicianId = Number(params.id);
  const setId = Number(params.setId);
  try {
    const data = await req.json();

    const existing = await prisma.setMusician.findFirst({
      where: { setId, musicianId }
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.setMusicianInstrument.deleteMany({
      where: { setMusicianId: existing.id }
    });

    const updated = await prisma.setMusician.update({
      where: { id: existing.id },
      data: {
        publicNotes: data.publicNotes ?? null,
        privateNotes: data.privateNotes ?? null,
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
    revalidateAll();
    return NextResponse.json({ musician: updated });
  } catch (error) {
    console.error('SetMusician update error:', error);
    return NextResponse.json({ error: "Failed to update set musician." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { setId: string; id: string } }) {
  const musicianId = Number(params.id);
  const setId = Number(params.setId);
  try {
    const existing = await prisma.setMusician.findFirst({
      where: { setId, musicianId }
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.setMusician.delete({ where: { id: existing.id } });
    revalidateAll();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete set musician." }, { status: 500 });
  }
}