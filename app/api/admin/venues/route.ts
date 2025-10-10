import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const data = await req.json();
    // Basic validation
    if (!data.name || typeof data.name !== 'string') {
      return NextResponse.json({ error: 'Venue name is required.' }, { status: 400 });
    }
    // Generate slug
    const { generateVenueSlug } = require("@/lib/utils/generateSlug");
    const slug = generateVenueSlug(data.name, data.city, data.stateProvince);
    const venue = await prisma.venue.create({
      data: {
        name: data.name,
        context: data.context || null,
        city: data.city || null,
        stateProvince: data.stateProvince || null,
        country: data.country || null,
        isUncertain: !!data.isUncertain,
        publicNotes: data.publicNotes || null,
        privateNotes: data.privateNotes || null,
        slug,
      },
    });
    return NextResponse.json({ venue }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create venue.' }, { status: 500 });
  }
}
