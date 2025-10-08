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
