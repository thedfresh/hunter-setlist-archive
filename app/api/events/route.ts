import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const events = await prisma.event.findMany({ orderBy: { year: 'desc' } });
    return NextResponse.json({ events });
  } catch (error) {
    console.error('GET /api/events error:', error);
    return NextResponse.json({ error: 'Failed to fetch events.', details: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    // Basic validation
    if (!data.year || isNaN(Number(data.year))) {
      return NextResponse.json({ error: 'Year is required and must be a number.' }, { status: 400 });
    }
    // Map form fields to Event model fields
    const event = await prisma.event.create({
      data: {
        year: Number(data.year),
        month: data.month ? Number(data.month) : null,
        day: data.day ? Number(data.day) : null,
        displayDate: data.displayDate || null,
        venueId: data.venueId ? Number(data.venueId) : null,
        eventTypeId: data.eventTypeId ? Number(data.eventTypeId) : null,
        contentTypeId: data.contentTypeId ? Number(data.contentTypeId) : null,
        primaryBandId: data.primaryBandId ? Number(data.primaryBandId) : null,
        notes: data.notes || null,
        // Add other fields as needed, e.g. dateUncertain, venueUncertain, etc.
      },
    });
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Event creation error:', error);
    return NextResponse.json({ error: 'Failed to create event.', details: String(error) }, { status: 500 });
  }
}
