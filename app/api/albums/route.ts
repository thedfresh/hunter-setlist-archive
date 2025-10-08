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
