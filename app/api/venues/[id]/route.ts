
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

import type { NextRequest } from 'next/server';
type Params = { id: string };

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: Params }) {
  try {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: 'Invalid venue id.' }, { status: 400 });
    const venue = await prisma.venue.findUnique({ where: { id } });
    if (!venue) return NextResponse.json({ error: 'Venue not found.' }, { status: 404 });
    return NextResponse.json({ venue });
  } catch (error) {
    console.error('GET /api/venues/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch venue.', details: String(error) }, { status: 500 });
  }
}