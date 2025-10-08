import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    // Basic validation
    if (!data.year || isNaN(Number(data.year))) {
      return NextResponse.json({ error: 'Year is required and must be a number.' }, { status: 400 });
    }

    // Transaction: create event and contributors
    const result = await prisma.$transaction(async (tx) => {
      // Create event
      const event = await tx.event.create({
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

      // If contributors array exists, create EventContributor records
      if (Array.isArray(data.contributors) && data.contributors.length > 0) {
        for (const c of data.contributors) {
          // Validate required fields
          if (!c.contributorId) {
            throw new Error('Missing contributorId for contributor');
          }
          await tx.eventContributor.create({
            data: {
              eventId: event.id,
              contributorId: Number(c.contributorId),
              description: c.description || null,
              publicNotes: c.publicNotes || null,
              privateNotes: c.privateNotes || null,
            },
          });
        }
      }
      return event;
    });
    return NextResponse.json({ event: result }, { status: 201 });
  } catch (error) {
    console.error('Event creation error:', error);
    return NextResponse.json({ error: 'Failed to create event.', details: String(error) }, { status: 500 });
  }
}
