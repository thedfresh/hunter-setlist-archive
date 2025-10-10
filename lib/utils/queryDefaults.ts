/**
 * Returns a Prisma where clause for stats (all public shows, includeInStats true only)
 */
export function getStatsEventWhere() {
    return {
        isPublic: true,
        isSpurious: false,
        includeInStats: true,
    };
}

/**
 * Returns a Prisma where clause for public browse (all public events, includeInStats can be true or false)
 */
export function getPublicBrowseWhere() {
    return {
        isPublic: true,
        isSpurious: false,
    };
}

/**
 * Returns a Prisma where clause for public-facing event queries.
 */
export function getPublicEventWhere() {
    return {
        isPublic: true,
        isSpurious: false,
        includeInStats: true,
    };
}

export function getAllEventsWhere() {
    return {
        isSpurious: false,
    };
}
