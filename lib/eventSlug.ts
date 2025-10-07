// lib/eventSlug.ts

export type ParsedSlug = {
  year: number | null;
  month: number | null;
  day: number | null;
  showTiming: string | null;
};

export function parseSlug(slug: string): ParsedSlug {
  let showTiming: string | null = null;
  let parsedSlug = slug;
  if (slug.endsWith('-early')) {
    showTiming = 'Early';
    parsedSlug = slug.slice(0, -6);
  } else if (slug.endsWith('-late')) {
    showTiming = 'Late';
    parsedSlug = slug.slice(0, -5);
  }
  // Handle unknown representations: could be 'YYYY-unknown-1' or 'YYYY-MM-unknown'
  const parts = parsedSlug.split('-');
  if (parsedSlug.includes('unknown')) {
    const y = parts[0];
    const m = parts[1];
    return {
      year: y ? parseInt(y, 10) : null,
      month: m && m !== 'unknown' ? parseInt(m, 10) : null,
      day: null,
      showTiming,
    };
  } else {
    const [y, m, d] = parts;
    return {
      year: y ? parseInt(y, 10) : null,
      month: m ? parseInt(m, 10) : null,
      day: d ? parseInt(d, 10) : null,
      showTiming,
    };
  }
}

export type EventForSlug = {
  year: number | null;
  month: number | null;
  day: number | null;
  showTiming?: string | null;
};

export function generateSlug(event: EventForSlug): string {
  const { year, month, day, showTiming } = event;
  // Handle partial dates
  if (month == null) {
    // No month/day known
    return `${year ?? 'unknown'}-unknown-1`;
  }
  if (day == null) {
    // Month known but day unknown
    const mm = month.toString().padStart(2, '0');
    return `${year}-${mm}-unknown`;
  }
  const mm = month.toString().padStart(2, '0');
  const dd = day.toString().padStart(2, '0');
  let slug = `${year}-${mm}-${dd}`;
  if (showTiming) {
    slug += `-${showTiming.toLowerCase()}`;
  }
  return slug;
}
