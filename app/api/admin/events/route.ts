import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    // Basic validation
    if (!data.year || isNaN(Number(data.year))) {
      return NextResponse.json({ error: 'Year is required and must be a number.' }, { status: 400 });
    }

    // Generate sortDate and slug
    const year = Number(data.year);
    const month = data.month ? Number(data.month) : null;
    const day = data.day ? Number(data.day) : null;
    const showTiming = data.showTiming || null;
    // sortDate: always set, fallback to first of month if missing day
    // Default time: 20:00 UTC, or 22:00 UTC if Late show
    let hour = 20;
    if (showTiming && showTiming.toLowerCase() === 'late') hour = 22;
    let sortDate: Date;
    if (year && month && day) {
      sortDate = new Date(Date.UTC(year, month - 1, day, hour, 0));
    } else if (year && month) {
      sortDate = new Date(Date.UTC(year, month - 1, 1, hour, 0));
    } else if (year) {
      sortDate = new Date(Date.UTC(year, 0, 1, hour, 0));
    } else {
      sortDate = new Date(); // fallback, should not happen
    }
    // Generate slug
    const { generateSlug } = await import('@/lib/utils/eventSlug');
    const slug = generateSlug({ year, month, day, showTiming });
    // Transaction: create event and contributors
    const result = await prisma.$transaction(async (tx) => {
      // Create event
      const event = await tx.event.create({
        data: {
          year,
          month,
          day,
          displayDate: data.displayDate || null,
          showTiming,
          venueId: data.venueId ? Number(data.venueId) : null,
          eventTypeId: data.eventTypeId ? Number(data.eventTypeId) : null,
          contentTypeId: data.contentTypeId ? Number(data.contentTypeId) : null,
          primaryBandId: data.primaryBandId ? Number(data.primaryBandId) : null,
          publicNotes: data.publicNotes || null,
          privateNotes: data.privateNotes || null,
          isUncertain: !!data.isUncertain,
          isPublic: data.isPublic !== false, // default to true
          sortDate,
          slug,
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
