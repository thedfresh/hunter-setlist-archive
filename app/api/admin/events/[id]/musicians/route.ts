import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const eventId = Number(params.id);
  const body = await req.json();
  // Expect body: { musicianId, instrumentId, publicNotes }
  if (!eventId || !body.musicianId || !body.instrumentId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  try {
    const eventMusician = await prisma.eventMusician.create({
      data: {
        eventId,
        musicianId: body.musicianId,
        instrumentId: body.instrumentId,
        publicNotes: body.publicNotes || '',
      },
    });
    return NextResponse.json({ eventMusician }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to add event musician' }, { status: 500 });
  }
}

