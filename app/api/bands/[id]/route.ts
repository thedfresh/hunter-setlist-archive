import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
      },
    });
    if (!band) return NextResponse.json({ error: 'Band not found.' }, { status: 404 });
    return NextResponse.json({ band });
  } catch (error) {
    console.error('GET /api/bands/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch band.', details: String(error) }, { status: 500 });
  }
}

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
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/bands/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete band.', details: String(error) }, { status: 500 });
  }
}
