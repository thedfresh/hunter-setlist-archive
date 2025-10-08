import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const musician = await prisma.musician.findUnique({
      where: { id: Number(id) },
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
