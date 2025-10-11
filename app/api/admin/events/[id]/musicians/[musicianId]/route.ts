import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function PUT(req: Request, { params }: { params: { id: string; musicianId: string } }) {
  const body = await req.json();
  const eventMusicianId = Number(params.musicianId);
  try {
    const updated = await prisma.eventMusician.update({
      where: { id: eventMusicianId },
      data: {
        musicianId: body.musicianId,
        instrumentId: body.instrumentId,
        publicNotes: body.publicNotes,
        privateNotes: body.privateNotes,
      },
    });
    revalidatePath('/api/events');
    revalidatePath('/event');
    return NextResponse.json({ eventMusician: updated });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update event musician' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string; musicianId: string } }) {
  const eventMusicianId = Number(params.musicianId);
  try {
    await prisma.eventMusician.delete({ where: { id: eventMusicianId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete event musician' }, { status: 500 });
  }
}
