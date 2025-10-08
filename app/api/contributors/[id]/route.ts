
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

import type { NextRequest } from 'next/server';
type Params = { id: string };

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    const { id: paramId } = await params;
    const id = Number(paramId);
    if (!id) return NextResponse.json({ error: 'Invalid contributor id.' }, { status: 400 });
    const contributor = await prisma.contributor.findUnique({ where: { id } });
    if (!contributor) return NextResponse.json({ error: 'Contributor not found.' }, { status: 404 });
    return NextResponse.json({ contributor });
  } catch (error) {
    console.error('GET /api/contributors/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch contributor.', details: String(error) }, { status: 500 });
  }
}
