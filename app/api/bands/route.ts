import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const bands = await prisma.band.findMany({
      orderBy: { name: 'asc' },
      include: {
        bandMusicians: {
          include: {
            musician: true,
          },
        },
      },
    });
    return NextResponse.json({ bands });
  } catch (error) {
    console.error('GET /api/bands error:', error);
    return NextResponse.json({ error: 'Failed to fetch bands.', details: String(error) }, { status: 500 });
  }
}
