import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

type Params = { id: string };

export async function GET(req: Request, { params }: { params: Params }) {
  try {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: 'Invalid band id.' }, { status: 400 });
    const band = await prisma.band.findUnique({
      where: { id },
      include: {
        bandMusicians: {
          include: {
            musician: true,
          },
        },
        _count: { select: { events: true } }
      },
    });
    if (!band) return NextResponse.json({ error: 'Band not found.' }, { status: 404 });
    return NextResponse.json({ band });
  } catch (error) {
    console.error('GET /api/bands/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch band.', details: String(error) }, { status: 500 });
  }
}
