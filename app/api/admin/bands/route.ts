import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.name || typeof data.name !== 'string') {
      return NextResponse.json({ error: 'Band name is required.' }, { status: 400 });
    }
    const band = await prisma.band.create({
      data: {
        name: data.name,
        publicNotes: typeof data.publicNotes === 'string' ? data.publicNotes : undefined,
        privateNotes: typeof data.privateNotes === 'string' ? data.privateNotes : undefined,
      },
    });
    return NextResponse.json({ band }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/bands error:', error);
    return NextResponse.json({ error: 'Failed to create band.', details: String(error) }, { status: 500 });
  }
}
