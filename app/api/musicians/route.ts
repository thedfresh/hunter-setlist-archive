import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const musicians = await prisma.musician.findMany({
      orderBy: { name: 'asc' },
      include: {
        defaultInstruments: {
          include: { instrument: true }
        }
      }
    });
    return NextResponse.json({ musicians });
  } catch (error) {
    console.error('GET /api/musicians error:', error);
    return NextResponse.json({ error: 'Failed to fetch musicians.', details: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.name || typeof data.name !== 'string') {
      return NextResponse.json({ error: 'Musician name is required.' }, { status: 400 });
    }
    const { name, isUncertain, publicNotes, privateNotes, defaultInstrumentIds } = data;
    // Step 1: Create musician
    const musician = await prisma.musician.create({
      data: {
        name,
        isUncertain: !!isUncertain,
        publicNotes: typeof publicNotes === 'string' ? publicNotes : undefined,
        privateNotes: typeof privateNotes === 'string' ? privateNotes : undefined,
      },
    });

    // Step 2: Create MusicianDefaultInstrument records
    if (defaultInstrumentIds && Array.isArray(defaultInstrumentIds) && defaultInstrumentIds.length > 0) {
      try {
        await prisma.musicianDefaultInstrument.createMany({
          data: defaultInstrumentIds.map((instrumentId: number) => ({
            musicianId: musician.id,
            instrumentId
          }))
        });
      } catch (err) {
        console.error('Error linking instruments to musician:', err);
      }
    }

    // Fetch musician and their default instruments for response
    const defaultInstruments = await prisma.musicianDefaultInstrument.findMany({
      where: { musicianId: musician.id },
      include: { instrument: true }
    });
    return NextResponse.json({ musician: { ...musician, defaultInstruments } }, { status: 201 });
  } catch (error) {
    console.error('POST /api/musicians error:', error);
    return NextResponse.json({ error: 'Failed to create musician.', details: String(error) }, { status: 500 });
  }
}
