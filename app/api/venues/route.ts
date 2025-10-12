import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic'


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
