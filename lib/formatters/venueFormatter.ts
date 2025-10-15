export function formatVenue(venue: {
    name?: string | null;
    context?: string | null;
    city?: string | null;
    stateProvince?: string | null;
    country?: string | null;
} | null | undefined): string {
    if (!venue) return '';

    let result = '';

    // Name and context go together without comma
    if (venue.name) {
        result = venue.name;
        if (venue.context) {
            result += ` (${venue.context})`;
        }
    }

    // Add location parts with commas
    const locationParts: string[] = [];
    if (venue.city) locationParts.push(venue.city);
    if (venue.stateProvince) locationParts.push(venue.stateProvince);
    if (venue.country && venue.country.trim().toUpperCase() !== '') {
        locationParts.push(venue.country);
    }

    if (locationParts.length > 0) {
        if (result) result += ', ';
        result += locationParts.join(', ');
    }

    return result;
}