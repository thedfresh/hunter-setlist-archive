import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient();

export async function GET() {
  try {
    const venues = await prisma.venue.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        context: true,
        city: true,
        stateProvince: true,
        country: true,
        isUncertain: true,
        createdAt: true,
        _count: { select: { events: true } }
      }
    });
    return NextResponse.json({ venues });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch venues.' }, { status: 500 });
  }
}
