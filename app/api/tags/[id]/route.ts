import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
type Params = { id: string };

export async function GET(req: Request, { params }: { params: Params }) {
  try {
    const tag = await prisma.tag.findUnique({ where: { id: Number(params.id) } });
    if (!tag) return NextResponse.json({ error: 'Tag not found.' }, { status: 404 });
    return NextResponse.json({ tag });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tag.' }, { status: 500 });
  }
}
