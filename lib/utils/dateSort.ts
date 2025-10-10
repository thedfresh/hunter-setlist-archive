// lib/dateSort.ts
// Universal date sorting logic for events

/**
 * Returns Prisma orderBy array for event date sorting.
 * NULL values sort before numbers for month/day.
 * Usage: prisma.event.findMany({ orderBy: getPrismaDateOrderBy() })
 */
export function getPrismaDateOrderBy() {
  // Canonical event sort: sortDate only
  return [
    { sortDate: 'asc' }
  ];
}

/**
 * Comparator for client-side event date sorting.
 * Handles all edge cases: nulls, unknowns, Early/Late, slug suffixes.
 *
 * @param a Event object { year, month, day, showTiming, slug }
 * @param b Event object { year, month, day, showTiming, slug }
 * @returns -1, 0, or 1 for array.sort()
 */
export function compareDates(a: any, b: any): number {
  // 0. Use sortDate if present
  if (a.sortDate && b.sortDate && a.sortDate !== b.sortDate) {
    return a.sortDate < b.sortDate ? -1 : 1;
  }

  // 1. Year
  if (a.year !== b.year) return (a.year ?? 0) - (b.year ?? 0);

  // 2. Month (nulls first)
  if ((a.month ?? null) !== (b.month ?? null)) {
    if (a.month == null) return -1;
    if (b.month == null) return 1;
    return a.month - b.month;
  }

  // 3. Day (nulls first)
  if ((a.day ?? null) !== (b.day ?? null)) {
    if (a.day == null) return -1;
    if (b.day == null) return 1;
    return a.day - b.day;
  }

  // 4. Unknown dates: use slug suffix (year-unknown-1, year-unknown-2)
  // If both month and day are null, check slug for ordering
  if (a.month == null && a.day == null && b.month == null && b.day == null) {
    const suffixA = getUnknownSuffix(a.slug);
    const suffixB = getUnknownSuffix(b.slug);
    if (suffixA !== suffixB) return suffixA - suffixB;
  }

  // 5. Show timing: Early before Late, null before both
  const timingOrder: Record<string, number> = { early: 1, late: 2 };
  const ta = a.showTiming ? timingOrder[String(a.showTiming).toLowerCase()] ?? 0 : 0;
  const tb = b.showTiming ? timingOrder[String(b.showTiming).toLowerCase()] ?? 0 : 0;
  if (ta !== tb) return ta - tb;

  return 0;
}

function getUnknownSuffix(slug?: string): number {
  // Example: '1978-unknown-2' => 2
  if (!slug) return 0;
  const match = slug.match(/unknown-(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * TESTS & EXAMPLES
 *
 * // Example events
 * const events = [
 *   { year: 1978, slug: '1978-unknown-2' },
 *   { year: 1978, slug: '1978-unknown-1' },
 *   { year: 1978, month: 5, slug: '1978-05' },
 *   { year: 1978, month: 5, day: 23, slug: '1978-05-23' },
 *   { year: 1978, month: 5, day: 23, showTiming: 'late', slug: '1978-05-23-late' },
 *   { year: 1978, month: 5, day: 23, showTiming: 'early', slug: '1978-05-23-early' },
 *   { year: 1978, month: 5, day: 23, showTiming: 'early', slug: '1978-05-23-early' },
 *   { year: 1978 },
 *   { year: 1979 },
 * ];
 *
 * // Sort
 * events.sort(compareDates);
 *
 * // Expected order:
 * // 1978-unknown-1
 * // 1978-unknown-2
 * // 1978
 * // 1978-05
 * // 1978-05-23
 * // 1978-05-23-early
 * // 1978-05-23-late
 * // 1979
 *
 * // Prisma orderBy usage:
 * // prisma.event.findMany({ orderBy: getPrismaDateOrderBy() })
 */
