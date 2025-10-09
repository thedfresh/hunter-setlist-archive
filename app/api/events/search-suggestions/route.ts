import { NextRequest, NextResponse } from 'next/server';
import { getCountableEventsWhere } from '@/lib/queryFilters';
import { prisma } from '@/lib/prisma';

// Helper: detect date patterns
function detectDateType(query: string) {
  if (/^\d{4}$/.test(query)) return 'year';
  if (/^\d{4}-\d{2}$/.test(query)) return 'yearMonth';
  if (/^\d{4}-\d{2}-\d{2}$/.test(query)) return 'date';
  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get('q') || '').trim();
  if (!query) return NextResponse.json({ suggestions: [] });

  const suggestions: any[] = [];
  const dateType = detectDateType(query);

  // 1. Date patterns: year, year-month, year-month-day
  if (dateType === 'year') {
    const yearNum = parseInt(query);
    if (!isNaN(yearNum)) {
      const count = await prisma.event.count({ where: { ...getCountableEventsWhere(), year: yearNum } });
      if (count > 0) {
        suggestions.push({
          type: 'year',
          value: String(yearNum),
          label: `${yearNum} (${count} shows)`
        });
      }
    }
  } else if (dateType === 'yearMonth') {
    const [yearStr, monthStr] = query.split('-');
    const yearNum = parseInt(yearStr);
    const monthNum = parseInt(monthStr);
    if (!isNaN(yearNum) && !isNaN(monthNum)) {
      const count = await prisma.event.count({ where: { ...getCountableEventsWhere(), year: yearNum, month: monthNum } });
      if (count > 0) {
        // Format: "March 1997 (4 shows)"
        const monthName = new Date(yearNum, monthNum - 1, 1).toLocaleString('default', { month: 'long' });
        suggestions.push({
          type: 'yearMonth',
          value: `${yearNum}-${monthStr}`,
          label: `${monthName} ${yearNum} (${count} shows)`
        });
      }
    }
  } else if (dateType === 'date') {
    const [yearStr, monthStr, dayStr] = query.split('-');
    const yearNum = parseInt(yearStr);
    const monthNum = parseInt(monthStr);
    const dayNum = parseInt(dayStr);
    if (!isNaN(yearNum) && !isNaN(monthNum) && !isNaN(dayNum)) {
      const event = await prisma.event.findFirst({ where: { ...getCountableEventsWhere(), year: yearNum, month: monthNum, day: dayNum } });
      if (event) {
        // Format: "March 2, 1997"
        const monthName = new Date(yearNum, monthNum - 1, 1).toLocaleString('default', { month: 'long' });
        suggestions.push({
          type: 'date',
          value: `${yearNum}-${monthStr}-${dayStr}`,
          label: `${monthName} ${dayNum}, ${yearNum}`
        });
      }
    }
  } else {
    // 2. Text: venue/city/state
    // Venue names
    const venues = await prisma.venue.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
          { stateProvince: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
    });
    for (const v of venues) {
      const count = await prisma.event.count({
        where: { ...getCountableEventsWhere(), venueId: v.id }
      });
      if (count > 0) {
        suggestions.push({
          type: 'venue',
          value: v.name,
          label: `${v.name}, ${v.city}${v.stateProvince ? ', ' + v.stateProvince : ''}`
        });
        if (v.city) {
          suggestions.push({
            type: 'city',
            value: v.city,
            label: `${v.city}${v.stateProvince ? ', ' + v.stateProvince : ''} (${count} shows)`
          });
        }
        if (v.stateProvince) {
          suggestions.push({
            type: 'state',
            value: v.stateProvince,
            label: `${v.stateProvince} (${count} shows)`
          });
        }
      }
      if (suggestions.length >= 10) break;
    }
  }

  // Limit to 10 suggestions, filter out duplicates
  const unique = [];
  const seen = new Set();
  for (const s of suggestions) {
    const key = `${s.type}:${s.value}`;
    if (!seen.has(key)) {
      unique.push(s);
      seen.add(key);
    }
    if (unique.length >= 10) break;
  }

  return NextResponse.json({ suggestions: unique });
}
