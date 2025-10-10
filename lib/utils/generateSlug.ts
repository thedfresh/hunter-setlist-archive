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
        .filter(Boolean)
        .join('-')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/--+/g, '-')
        .slice(0, 64);
}