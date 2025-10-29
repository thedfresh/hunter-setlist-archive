import { NextResponse } from 'next/server';
import { getBrowsableEventsWhere } from '@/lib/utils/queryFilters';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    // Check for ?types=... query param
    const url = new URL('http://localhost' + (typeof window === 'undefined' ? '' : window.location.pathname));
    // In Next.js API routes, use req.url if available
    let typesParam = '';
    if (typeof window === 'undefined') {
      // @ts-ignore
      if (typeof arguments[0]?.url === 'string') {
        const reqUrl = arguments[0].url;
        const searchParams = new URL(reqUrl, 'http://localhost').searchParams;
        typesParam = searchParams.get('types') || '';
      }
    }
    if (typesParam === 'eventTypes') {
      const eventTypes = await prisma.eventType.findMany({ orderBy: { name: 'asc' } });
      return NextResponse.json({ eventTypes });
    }
    if (typesParam === 'contentTypes') {
      const contentTypes = await prisma.contentType.findMany({ orderBy: { name: 'asc' } });
      return NextResponse.json({ contentTypes });
    }
    if (typesParam === 'bands') {
      const bands = await prisma.band.findMany({ orderBy: { name: 'asc' } });
      return NextResponse.json({ bands });
    }
    // Default: return events with sets, setTypes, performances, and songs
    const events = await prisma.event.findMany({
      where: {
        ...getBrowsableEventsWhere(),
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
        { day: 'desc' }
      ],
      include: {
        venue: true,
        primaryBand: true,  // include band for name display
        sets: {
          include: {
            setType: true,
            performances: {
              include: {
                song: true,
                performanceMusicians: {
                  include: {
                    musician: true,
                    instrument: true,
                  },
                },
              },
              orderBy: { performanceOrder: 'asc' },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });
    return NextResponse.json({ events });
  } catch (error) {
    console.error('GET /api/events error:', error);
    return NextResponse.json({ error: 'Failed to fetch events.', details: String(error) }, { status: 500 });
  }
}
