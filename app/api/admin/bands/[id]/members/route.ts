import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
type Params = { id: string };

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
    // Convert dates to UTC
    const joinedDateUTC = data.joinedDate ? new Date(data.joinedDate + 'T00:00:00.000Z') : null;
    const leftDateUTC = data.leftDate ? new Date(data.leftDate + 'T00:00:00.000Z') : null;
    const member = await prisma.bandMusician.create({
      data: {
        bandId,
        musicianId: data.musicianId,
        joinedDate: joinedDateUTC,
        leftDate: leftDateUTC,
        publicNotes: typeof data.publicNotes === 'string' ? data.publicNotes : undefined,
        privateNotes: typeof data.privateNotes === 'string' ? data.privateNotes : undefined,
      },
      include: {
        musician: true,
      },
    });
    revalidatePath('/api/bands')
    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/bands/[id]/members error:', error);
    return NextResponse.json({ error: 'Failed to add band member.', details: String(error) }, { status: 500 });
  }
}
