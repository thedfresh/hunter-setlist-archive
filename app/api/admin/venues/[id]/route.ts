
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
type Params = { id: string };

const prisma = new PrismaClient();


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
    revalidatePath('/api/venues');
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
    revalidatePath('/api/venues');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/venues/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete venue.', details: String(error) }, { status: 500 });
  }
}
