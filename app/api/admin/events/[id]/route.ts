import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import type { NextRequest } from 'next/server';
type Params = { id: string };

export async function PUT(req: NextRequest, context: { params: Promise<Params> }) {
  try {
    const params = await context.params;
    const id = Number(params.id);
    const data = await req.json();
    if (!id || !data.year || isNaN(Number(data.year))) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
    }
    // Update event including etreeShowId
    const event = await prisma.event.update({
      where: { id },
      data: {
        year: Number(data.year),
        month: data.month ? Number(data.month) : null,
        day: data.day ? Number(data.day) : null,
        displayDate: data.displayDate || null,
        showTiming: data.showTiming || null,
        // include slug field
        slug: data.slug || null,
        // relations: use connect/disconnect for foreign keys
        ...(data.venueId
          ? { venue: { connect: { id: Number(data.venueId) } } }
          : { venue: { disconnect: true } }),
        ...(data.eventTypeId
          ? { eventType: { connect: { id: Number(data.eventTypeId) } } }
          : { eventType: { disconnect: true } }),
        ...(data.contentTypeId
          ? { contentType: { connect: { id: Number(data.contentTypeId) } } }
          : { contentType: { disconnect: true } }),
        ...(data.primaryBandId
          ? { primaryBand: { connect: { id: Number(data.primaryBandId) } } }
          : { primaryBand: { disconnect: true } }),
        etreeShowId: data.etreeShowId || null,
        publicNotes: data.publicNotes || null,
        privateNotes: data.privateNotes || null,
        rawData: data.rawData || null,
        rawDataGdsets: data.rawDataGdsets || null,
        billing: data.billing || null,
        hunterParticipationUncertain: !!data.hunterParticipationUncertain,
        isSpurious: !!data.isSpurious,
        includeInStats: data.includeInStats !== false,
        isUncertain: !!data.isUncertain,
        isPublic: data.isPublic !== false,
        verified: !!data.verified,
      } as any,
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
