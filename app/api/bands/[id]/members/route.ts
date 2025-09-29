import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
type Params = { id: string };

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

export async function POST(req: Request, { params }: { params: Params }) {
  try {
    const bandId = Number(params.id);
    const data = await req.json();
    if (!bandId || !data.musicianId || typeof data.musicianId !== 'number') {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
    }
    if (data.joinedDate && data.leftDate && new Date(data.leftDate) < new Date(data.joinedDate)) {
      return NextResponse.json({ error: 'leftDate must be after joinedDate.' }, { status: 400 });
    }
    const member = await prisma.bandMusician.create({
      data: {
        bandId,
        musicianId: data.musicianId,
        joinedDate: data.joinedDate ? new Date(data.joinedDate) : null,
        leftDate: data.leftDate ? new Date(data.leftDate) : null,
        publicNotes: typeof data.publicNotes === 'string' ? data.publicNotes : undefined,
        privateNotes: typeof data.privateNotes === 'string' ? data.privateNotes : undefined,
      },
      include: {
        musician: true,
      },
    });
    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error('POST /api/bands/[id]/members error:', error);
    return NextResponse.json({ error: 'Failed to add band member.', details: String(error) }, { status: 500 });
  }
}
