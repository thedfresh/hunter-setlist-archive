import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const musician = await prisma.musician.findUnique({
      where: { id: Number(params.id) },
      include: {
        defaultInstruments: { include: { instrument: true } }
      }
    });
    if (!musician) {
      return NextResponse.json({ error: 'Musician not found.' }, { status: 404 });
    }
    return NextResponse.json({ musician });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch musician.' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    if (!data.name || typeof data.name !== 'string') {
      return NextResponse.json({ error: 'Musician name is required.' }, { status: 400 });
    }
    const { name, isUncertain, defaultInstrumentIds } = data;
    // Remove all existing default instruments and set new ones
    const musician = await prisma.musician.update({
      where: { id: Number(params.id) },
      data: {
        name,
        isUncertain: !!isUncertain,
        defaultInstruments: {
          deleteMany: {},
          create: defaultInstrumentIds && Array.isArray(defaultInstrumentIds)
            ? defaultInstrumentIds.map((instrumentId: number) => ({ instrument: { connect: { id: instrumentId } } }))
            : [],
        },
      },
      include: {
        defaultInstruments: { include: { instrument: true } }
      }
    });
    return NextResponse.json({ musician });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update musician.' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.musician.delete({
      where: { id: Number(params.id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete musician.' }, { status: 500 });
  }
}
