import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
    const member = await prisma.bandMusician.update({
      where: { id: memberId },
      data: {
        joinedDate: data.joinedDate ? new Date(data.joinedDate) : null,
        leftDate: data.leftDate ? new Date(data.leftDate) : null,
        publicNotes: typeof data.publicNotes === 'string' ? data.publicNotes : undefined,
        privateNotes: typeof data.privateNotes === 'string' ? data.privateNotes : undefined,
      },
      include: {
        musician: true,
      },
    });
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
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/bands/[id]/members/[memberId] error:', error);
    return NextResponse.json({ error: 'Failed to delete band member.', details: String(error) }, { status: 500 });
  }
}
