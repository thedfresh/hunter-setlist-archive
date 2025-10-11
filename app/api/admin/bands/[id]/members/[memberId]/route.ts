import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
type Params = { id: string; memberId: string };

export async function PUT(req: Request, { params }: { params: Params }) {
  try {
    const bandId = Number(params.id);
    const memberId = Number(params.memberId);
    const data = await req.json();
    if (!bandId || !memberId) {
      return NextResponse.json({ error: 'Invalid band or member id.' }, { status: 400 });
    }
    if (data.joinedDate && data.leftDate && new Date(data.leftDate) < new Date(data.joinedDate)) {
      return NextResponse.json({ error: 'leftDate must be after joinedDate.' }, { status: 400 });
    }
    // Convert dates to UTC
    const joinedDateUTC = data.joinedDate ? new Date(data.joinedDate + 'T00:00:00.000Z') : null;
    const leftDateUTC = data.leftDate ? new Date(data.leftDate + 'T00:00:00.000Z') : null;
    const member = await prisma.bandMusician.update({
      where: { id: memberId },
      data: {
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
    return NextResponse.json({ member });
  } catch (error) {
    console.error('PUT /api/bands/[id]/members/[memberId] error:', error);
    return NextResponse.json({ error: 'Failed to update band member.', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  try {
    const memberId = Number(params.memberId);
    if (!memberId) return NextResponse.json({ error: 'Invalid member id.' }, { status: 400 });
    await prisma.bandMusician.delete({ where: { id: memberId } });
    revalidatePath('/api/bands')
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/bands/[id]/members/[memberId] error:', error);
    return NextResponse.json({ error: 'Failed to delete band member.', details: String(error) }, { status: 500 });
  }
}
