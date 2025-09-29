import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import type { NextRequest } from 'next/server';
type Params = { id: string };

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await context.params;
    const id = Number(paramId);
    if (!id) return NextResponse.json({ error: 'Invalid event id.' }, { status: 400 });
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    return NextResponse.json({ event });
  } catch (error) {
    console.error('GET /api/events/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch event.', details: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<Params> }) {
  try {
    const params = await context.params;
    const id = Number(params.id);
    const data = await req.json();
    if (!id || !data.year || isNaN(Number(data.year))) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
    }
    const event = await prisma.event.update({
      where: { id },
      data: {
        year: Number(data.year),
        month: data.month ? Number(data.month) : null,
        day: data.day ? Number(data.day) : null,
        displayDate: data.displayDate || null,
        showTiming: data.showTiming || null,
        venueId: data.venueId ? Number(data.venueId) : null,
        eventTypeId: data.eventTypeId ? Number(data.eventTypeId) : null,
        contentTypeId: data.contentTypeId ? Number(data.contentTypeId) : null,
        primaryBandId: data.primaryBandId ? Number(data.primaryBandId) : null,
        publicNotes: data.publicNotes || null,
        privateNotes: data.privateNotes || null,
        isUncertain: !!data.isUncertain,
        isPublic: data.isPublic !== false, // default to true
      },
    });
    return NextResponse.json({ event });
  } catch (error) {
    console.error('PUT /api/events/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update event.', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    const { id: paramId } = await params;
    const id = Number(paramId);
    if (!id) return NextResponse.json({ error: 'Invalid event id.' }, { status: 400 });
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/events/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete event.', details: String(error) }, { status: 500 });
  }
}
