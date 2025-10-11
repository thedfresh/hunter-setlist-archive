import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
type Params = { id: string };
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Params }) {
  try {
    const bandId = Number(params.id);
    if (!bandId) return NextResponse.json({ error: 'Invalid band id.' }, { status: 400 });
    const members = await prisma.bandMusician.findMany({
      where: { bandId },
      include: {
        musician: true,
      },
      orderBy: { joinedDate: 'asc' },
    });
    return NextResponse.json({ members });
  } catch (error) {
    console.error('GET /api/bands/[id]/members error:', error);
    return NextResponse.json({ error: 'Failed to fetch band members.', details: String(error) }, { status: 500 });
  }
}
