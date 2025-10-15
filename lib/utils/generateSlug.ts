import { prisma } from '@/lib/prisma';

/**
 * Resolves slug collisions for a given table by appending -1, -2, etc. until unique.
 * @param baseSlug The base slug to try
 * @param table The table name (e.g. 'events', 'songs', etc.)
 * @param excludeId Optional id to exclude from collision check
 * @returns Promise<string> - first available slug
 */
export async function resolveSlugCollision(
    baseSlug: string,
    table: 'events' | 'songs' | 'venues' | 'bands' | 'musicians' | 'contributors' | 'albums' | 'tags',
    excludeId?: number
): Promise<string> {
    for (let i = 0; i < 1000; i++) {
        const candidate = i === 0 ? baseSlug : `${baseSlug}-${i}`;

        let existing;
        switch (table) {
            case 'events':
                existing = await prisma.event.findUnique({ where: { slug: candidate } });
                break;
            case 'songs':
                existing = await prisma.song.findUnique({ where: { slug: candidate } });
                break;
            case 'venues':
                existing = await prisma.venue.findUnique({ where: { slug: candidate } });
                break;
            case 'bands':
                existing = await prisma.band.findUnique({ where: { slug: candidate } });
                break;
            case 'musicians':
                existing = await prisma.musician.findUnique({ where: { slug: candidate } });
                break;
            case 'contributors':
                existing = await prisma.contributor.findUnique({ where: { slug: candidate } });
                break;
            case 'albums':
                existing = await prisma.album.findUnique({ where: { slug: candidate } });
                break;
        }

        // If no record found, slug is available
        if (!existing) return candidate;

        // If we're excluding an ID and this is that record, slug is available for reuse
        if (excludeId !== undefined && existing.id === excludeId) return candidate;
    }
    throw new Error('Could not resolve unique slug after 1000 attempts');
}
/**
 * ONLY used in admin interfaces to generate slugs when creating/editing records.
 * Public pages should NEVER generate slugs - always use database slug field.
 */

export function generateSlugFromName(name: string): string {
    return slugify([name]);
}

export function generateVenueSlug(name: string, city?: string, state?: string): string {
    return slugify([name, city, state]);
}

function slugify(parts: (string | undefined)[]): string {
    return parts
        .filter((part): part is string => Boolean(part))  // ← Type predicate
        .map(part =>
            part
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')  // Remove punctuation, keep spaces
                .replace(/\s+/g, '-')          // Spaces to dashes
                .trim()
        )
        .filter(Boolean)
        .join('-')                             // Join parts with dash
        .replace(/--+/g, '-')                  // Dedupe dashes
        .slice(0, 64);
}