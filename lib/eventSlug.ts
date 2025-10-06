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
  if (parsedSlug.includes('unknown')) {
    // e.g. 1997-unknown
    const [y] = parsedSlug.split('-');
    return {
      year: y ? parseInt(y, 10) : null,
      month: null,
      day: null,
      showTiming,
    };
  } else {
    const [y, m, d] = parsedSlug.split('-');
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
  if (month == null || day == null) {
    return `${year ?? 'unknown'}-unknown-1`;
  }
  const mm = month.toString().padStart(2, '0');
  const dd = day.toString().padStart(2, '0');
  let slug = `${year}-${mm}-${dd}`;
  if (showTiming) {
    slug += `-${showTiming.toLowerCase()}`;
  }
  return slug;
}
