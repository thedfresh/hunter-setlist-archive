import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const eventId = Number(params.id);
  const { contributorId, description, publicNotes } = await req.json();
  if (!eventId || !contributorId) {
    return NextResponse.json({ error: 'Missing eventId or contributorId' }, { status: 400 });
  }
  try {
    const eventContributor = await prisma.eventContributor.create({
      data: {
        eventId,
        contributorId,
        description,
        publicNotes,
      },
      include: { contributor: true },
    });
    revalidatePath('/api/events');
    revalidatePath('/event');
    return NextResponse.json({
      id: eventContributor.id,
      contributorId: eventContributor.contributorId,
      contributorName: eventContributor.contributor?.name || '',
      description: eventContributor.description,
      publicNotes: eventContributor.publicNotes,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create event contributor', details: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const eventId = Number(params.id);
  const { id, contributorId, description, publicNotes } = await req.json();
  if (!eventId || !id || !contributorId) {
    return NextResponse.json({ error: 'Missing eventId, id, or contributorId' }, { status: 400 });
  }
  try {
    const updated = await prisma.eventContributor.update({
      where: { id },
      data: { contributorId, description, publicNotes },
      include: { contributor: true },
    });
    revalidatePath('/api/events');
    revalidatePath('/event');
    return NextResponse.json({
      id: updated.id,
      contributorId: updated.contributorId,
      contributorName: updated.contributor?.name || '',
      description: updated.description,
      publicNotes: updated.publicNotes,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update event contributor', details: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const eventContributorId = Number(params.id);
  if (!eventContributorId) {
    return NextResponse.json({ error: 'Missing eventContributorId' }, { status: 400 });
  }
  try {
    await prisma.eventContributor.delete({ where: { id: eventContributorId } });
    revalidatePath('/api/events');
    revalidatePath('/event');
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete event contributor', details: String(err) }, { status: 500 });
  }
}
