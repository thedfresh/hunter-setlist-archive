
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

export async function PUT(req: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    const { id: paramId } = await params;
    const id = Number(paramId);
    const data = await req.json();
    if (!id || !data.name || typeof data.name !== 'string') {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
    }
    const contributor = await prisma.contributor.update({
      where: { id },
      data: {
        name: data.name,
        email: typeof data.email === 'string' ? data.email : undefined,
        notes: typeof data.notes === 'string' ? data.notes : undefined,
      },
    });
    return NextResponse.json({ contributor });
  } catch (error) {
    console.error('PUT /api/contributors/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update contributor.', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    const { id: paramId } = await params;
    const id = Number(paramId);
    if (!id) return NextResponse.json({ error: 'Invalid contributor id.' }, { status: 400 });
    await prisma.contributor.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/contributors/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete contributor.', details: String(error) }, { status: 500 });
  }
}
