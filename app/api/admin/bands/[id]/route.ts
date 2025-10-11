import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

type Params = { id: string };

export async function PUT(req: Request, { params }: { params: Params }) {
  try {
    const id = Number(params.id);
    const data = await req.json();
    if (!id || !data.name || typeof data.name !== 'string') {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
    }
    const band = await prisma.band.update({
      where: { id },
      data: {
        name: data.name,
        displayName: typeof data.displayName === 'string' ? data.displayName : undefined,
        isHunterBand: typeof data.isHunterBand === 'boolean' ? data.isHunterBand : true,
        publicNotes: typeof data.publicNotes === 'string' ? data.publicNotes : undefined,
        privateNotes: typeof data.privateNotes === 'string' ? data.privateNotes : undefined,
      },
      include: {
        bandMusicians: {
          include: {
            musician: true,
          },
        },
      },
    });
    revalidatePath('/api/bands')
    return NextResponse.json({ band });
  } catch (error) {
    console.error('PUT /api/bands/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update band.', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  try {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: 'Invalid band id.' }, { status: 400 });
    await prisma.band.delete({ where: { id } });
    revalidatePath('/api/bands')
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/bands/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete band.', details: String(error) }, { status: 500 });
  }
}
