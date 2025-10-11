import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = Number(searchParams.get('month'));
  const day = Number(searchParams.get('day'));
  if (!month || !day) {
    return NextResponse.json({ events: [] });
  }
  const events = await prisma.event.findMany({
    where: { month, day },
    select: {
      id: true,
      year: true,
      month: true,
      day: true,
      displayDate: true,
      slug: true,
      verified: true,
      showTiming: true,
      venue: { select: { name: true, city: true, stateProvince: true } },
      primaryBand: { select: { name: true } },
      sets: {
        select: {
          id: true,
          setType: { select: { displayName: true } },
          performances: {
            select: {
              id: true,
              song: { select: { title: true } },
              seguesInto: true,
              performanceOrder: true,
            },
            orderBy: { performanceOrder: 'asc' },
          },
        },
        orderBy: { position: 'asc' },
      },
    },
    orderBy: { sortDate: 'asc' },
  });
  return NextResponse.json({ events });
}
