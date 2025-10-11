import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();
type Params = { id: string };

export async function PUT(req: Request, { params }: { params: Promise<Params> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    if (!data.title || typeof data.title !== 'string') {
      return NextResponse.json({ error: 'Album title is required.' }, { status: 400 });
    }
    const album = await prisma.album.update({
      where: { id: Number(id) },
      data: {
        title: data.title.trim(),
        artist: data.artist || null,
        releaseYear: data.releaseYear ? Number(data.releaseYear) : null,
        isOfficial: !!data.isOfficial,
        publicNotes: data.publicNotes || null,
        privateNotes: data.privateNotes || null,
      },
    });
    revalidatePath('/api/albums')
    return NextResponse.json({ album });
  } catch {
    return NextResponse.json({ error: 'Failed to update album.' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<Params> }) {
  try {
    const { id } = await params;
    await prisma.album.delete({ where: { id: Number(id) } });
    revalidatePath('/api/albums')
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete album.' }, { status: 500 });
  }
}
