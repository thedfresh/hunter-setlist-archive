// lib/eventQueries.ts
import { prisma } from './prisma';
import { parseSlug, generateSlug, ParsedSlug } from './eventSlug';

export type EventWithAll = Awaited<ReturnType<typeof fetchEventBySlug>>;

export async function fetchEventBySlug(slug: string) {
  const { year, month, day, showTiming }: ParsedSlug = parseSlug(slug);
  const event = await prisma.event.findFirst({
    where: { year, month, day, showTiming },
    include: {
      venue: true,
      primaryBand: true,
      eventType: true,
      contentType: true,
      sets: {
        include: {
          setType: true,
          performances: {
            include: {
              song: true,
              showBanter: { orderBy: { id: 'asc' } },
            },
            orderBy: { performanceOrder: 'asc' },
          },
        },
        orderBy: { position: 'asc' },
      },
      eventMusicians: {
        include: { musician: true, instrument: true },
      },
      recordings: {
        include: { recordingType: true, contributor: true },
      },
      eventContributors: {
        include: { contributor: true },
      },
    },
  });
  return event;
}

export type EventForAdjacent = {
  year: number | null;
  month: number | null;
  day: number | null;
  showTiming?: string | null;
};

export async function fetchAdjacentEvents(event: EventForAdjacent) {
  const { year, month, day, showTiming } = event;
  // Helper to build valid where clauses for prev/next
  function isNum(n: number | null | undefined): n is number {
    return typeof n === 'number' && !isNaN(n);
  }
  // Previous event: before current date
  const prevWhere: any[] = [];
  if (isNum(year)) prevWhere.push({ year: { lt: year } });
  if (isNum(year) && isNum(month)) prevWhere.push({ year, month: { lt: month } });
  if (isNum(year) && isNum(month) && isNum(day)) prevWhere.push({ year, month, day: { lt: day } });
  if (isNum(year) && isNum(month) && isNum(day) && showTiming) prevWhere.push({ year, month, day, showTiming: { lt: showTiming } });
  const prev = await prisma.event.findFirst({
    where: {
      OR: prevWhere.length > 0 ? prevWhere : undefined,
    },
    orderBy: [
      { year: 'desc' },
      { month: 'desc' },
      { day: 'desc' },
      { showTiming: 'desc' },
    ],
    select: { year: true, month: true, day: true, showTiming: true },
  });
  // Next event: after current date
  const nextWhere: any[] = [];
  if (isNum(year)) nextWhere.push({ year: { gt: year } });
  if (isNum(year) && isNum(month)) nextWhere.push({ year, month: { gt: month } });
  if (isNum(year) && isNum(month) && isNum(day)) nextWhere.push({ year, month, day: { gt: day } });
  if (isNum(year) && isNum(month) && isNum(day) && showTiming) nextWhere.push({ year, month, day, showTiming: { gt: showTiming } });
  const next = await prisma.event.findFirst({
    where: {
      OR: nextWhere.length > 0 ? nextWhere : undefined,
    },
    orderBy: [
      { year: 'asc' },
      { month: 'asc' },
      { day: 'asc' },
      { showTiming: 'asc' },
    ],
    select: { year: true, month: true, day: true, showTiming: true },
  });
  return {
    prev: prev ? { ...prev, slug: generateSlug(prev) } : null,
    next: next ? { ...next, slug: generateSlug(next) } : null,
  };
}
