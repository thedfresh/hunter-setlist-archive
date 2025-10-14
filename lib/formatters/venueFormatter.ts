export function formatVenue(venue: {
    name?: string | null;
    context?: string | null;
    city?: string | null;
    stateProvince?: string | null;
    country?: string | null;
} | null | undefined): string {
    if (!venue) return '';
    const parts: string[] = [];
    if (venue.name) parts.push(venue.name);
    if (venue.context) parts.push(`({venue.context})`);
    if (venue.city) parts.push(venue.city);
    if (venue.stateProvince) parts.push(venue.stateProvince);
    if (venue.country && venue.country.trim().toUpperCase() !== '') {
        parts.push(venue.country);
    }
    return parts.filter(Boolean).join(', ');
}
