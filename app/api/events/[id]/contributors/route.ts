import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const eventId = Number(id);
  if (!eventId) {
    return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
  }
  try {
    const contributors = await prisma.eventContributor.findMany({
      where: { eventId },
      include: { contributor: true },
    });
    return NextResponse.json(contributors.map(ec => ({
      id: ec.id,
      contributorId: ec.contributorId,
      contributorName: ec.contributor?.name || '',
      description: ec.description,
      notes: ec.notes,
    })));
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch event contributors', details: String(err) }, { status: 500 });
  }
}
