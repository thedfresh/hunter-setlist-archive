
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

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  try {
    const id = Number(params.id);
    const data = await req.json();
    if (!id || !data.name || typeof data.name !== 'string') {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
    }
    const venue = await prisma.venue.update({
      where: { id },
      data: {
        name: data.name,
        context: data.context || null,
        city: data.city || null,
        stateProvince: data.stateProvince || null,
        country: data.country || null,
        publicNotes: typeof data.publicNotes === 'string' ? data.publicNotes : null,
        privateNotes: typeof data.privateNotes === 'string' ? data.privateNotes : null,
        isUncertain: !!data.isUncertain,
      },
    });
    return NextResponse.json({ venue });
  } catch (error) {
    console.error('PUT /api/venues/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update venue.', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  try {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: 'Invalid venue id.' }, { status: 400 });
    await prisma.venue.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/venues/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete venue.', details: String(error) }, { status: 500 });
  }
}
