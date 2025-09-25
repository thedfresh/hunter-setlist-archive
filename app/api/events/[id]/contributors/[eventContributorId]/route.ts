import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(req: NextRequest, { params }: { params: { id: string, eventContributorId: string } }) {
  const eventContributorId = Number(params.eventContributorId);
  const { contributorId, description, notes } = await req.json();
  if (!eventContributorId || !contributorId) {
    return NextResponse.json({ error: 'Missing eventContributorId or contributorId' }, { status: 400 });
  }
  try {
    const updated = await prisma.eventContributor.update({
      where: { id: eventContributorId },
      data: { contributorId, description, notes },
      include: { contributor: true },
    });
    return NextResponse.json({
      id: updated.id,
      contributorId: updated.contributorId,
      contributorName: updated.contributor?.name || '',
      description: updated.description,
      notes: updated.notes,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update event contributor', details: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string, eventContributorId: string } }) {
  const eventContributorId = Number(params.eventContributorId);
  if (!eventContributorId) {
    return NextResponse.json({ error: 'Missing eventContributorId' }, { status: 400 });
  }
  try {
    await prisma.eventContributor.delete({ where: { id: eventContributorId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete event contributor', details: String(err) }, { status: 500 });
  }
}
