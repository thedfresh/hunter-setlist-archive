import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const albums = await prisma.album.findMany({ orderBy: { releaseYear: 'desc' } });
    return NextResponse.json({ albums });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch albums.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.title || typeof data.title !== 'string') {
      return NextResponse.json({ error: 'Album title is required.' }, { status: 400 });
    }
    const album = await prisma.album.create({
      data: {
        title: data.title.trim(),
        artist: data.artist || null,
        releaseYear: data.releaseYear ? Number(data.releaseYear) : null,
        isOfficial: !!data.isOfficial,
        notes: data.notes || null,
      },
    });
    return NextResponse.json({ album }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create album.' }, { status: 500 });
  }
}
