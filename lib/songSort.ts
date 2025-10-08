// lib/songSort.ts
// Alphabetical song title sorting with article handling

/**
 * Remove leading articles for sorting.
 * Handles English and common international articles.
 * @param title Song title
 * @returns Title with leading article removed
 */
export function stripArticles(title: string): string {
  if (!title) return '';
  return title.replace(/^(the |a |an |los |las |el |la |le |les )/i, '').trim();
}

/**
 * Comparator for song titles, ignoring leading articles.
 * @param a Song object with title
 * @param b Song object with title
 * @returns -1, 0, or 1 for array.sort()
 */
export function compareSongTitles(a: { title: string }, b: { title: string }): number {
  const ta = stripArticles(a.title).toLowerCase();
  const tb = stripArticles(b.title).toLowerCase();
  if (ta < tb) return -1;
  if (ta > tb) return 1;
  return 0;
}

/**
 * Returns Prisma orderBy for song sorting.
 * If using sortName field: [{ sortName: 'asc' }]
 * Otherwise: [{ title: 'asc' }]
 */
export function getPrismaSongOrderBy(useSortName: boolean = false) {
  return useSortName ? [{ sortName: 'asc' }] : [{ title: 'asc' }];
}

/**
 * TESTS & EXAMPLES
 *
 * stripArticles('The Fillmore') // 'Fillmore'
 * stripArticles('A Hard Rain') // 'Hard Rain'
 * stripArticles('Box of Rain') // 'Box of Rain'
 * stripArticles('Los Lobos') // 'Lobos'
 * stripArticles('Le Monde') // 'Monde'
 *
 * // Sorting
 * const songs = [
 *   { title: 'The Fillmore' },
 *   { title: 'A Hard Rain' },
 *   { title: 'Box of Rain' },
 *   { title: 'Los Lobos' },
 *   { title: 'Le Monde' },
 * ];
 * songs.sort(compareSongTitles);
 * // Expected order: Box of Rain, Fillmore, Hard Rain, Lobos, Monde
 *
 * // Prisma orderBy usage:
 * // prisma.song.findMany({ orderBy: getPrismaSongOrderBy(true) })
 */
