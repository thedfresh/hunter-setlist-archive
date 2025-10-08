// lib/generateSlug.ts


export function generateSlugFromName(name: string): string {
  return slugify([name]);
}

export function generateVenueSlug(name: string, city?: string, state?: string): string {
  // Combine name, city, state, filter out empty, join with dash
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
