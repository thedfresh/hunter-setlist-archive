import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
type Params = { id: string };

export async function GET(req: Request, { params }: { params: Params }) {
  try {
    const album = await prisma.album.findUnique({ where: { id: Number(params.id) } });
    if (!album) return NextResponse.json({ error: 'Album not found.' }, { status: 404 });
    return NextResponse.json({ album });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch album.' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Params }) {
  try {
    const data = await req.json();
    if (!data.title || typeof data.title !== 'string') {
      return NextResponse.json({ error: 'Album title is required.' }, { status: 400 });
    }
    const album = await prisma.album.update({
      where: { id: Number(params.id) },
      data: {
        title: data.title.trim(),
        artist: data.artist || null,
        releaseYear: data.releaseYear ? Number(data.releaseYear) : null,
        isOfficial: !!data.isOfficial,
        notes: data.notes || null,
      },
    });
    return NextResponse.json({ album });
  } catch {
    return NextResponse.json({ error: 'Failed to update album.' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  try {
    await prisma.album.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete album.' }, { status: 500 });
  }
}
