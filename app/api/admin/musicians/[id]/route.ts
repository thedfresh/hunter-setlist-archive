import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    if (!data.name || typeof data.name !== 'string') {
      return NextResponse.json({ error: 'Musician name is required.' }, { status: 400 });
    }
    const { name, isUncertain, publicNotes, privateNotes, defaultInstrumentIds } = data;
    // Remove all existing default instruments and set new ones
    const musician = await prisma.musician.update({
      where: { id: Number(id) },
      data: {
        name,
        isUncertain: !!isUncertain,
        publicNotes: typeof publicNotes === 'string' ? publicNotes : undefined,
        privateNotes: typeof privateNotes === 'string' ? privateNotes : undefined,
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
    revalidatePath('/api/musicians')
    return NextResponse.json({ musician });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update musician.' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.musician.delete({
      where: { id: Number(id) },
    });
    revalidatePath('/api/musicians')
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete musician.' }, { status: 500 });
  }
}
