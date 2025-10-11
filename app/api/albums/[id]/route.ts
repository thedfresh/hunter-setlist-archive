import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();
type Params = { id: string };

export async function GET(req: Request, { params }: { params: Promise<Params> }) {
  try {
    const { id } = await params;
    const album = await prisma.album.findUnique({ where: { id: Number(id) } });
    if (!album) return NextResponse.json({ error: 'Album not found.' }, { status: 404 });
    return NextResponse.json({ album });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch album.' }, { status: 500 });
  }
}
