/**
 * For browsing events, event detail pages, and prev/next navigation
 * Shows everything public (including Studio Sessions and Errata with indicators)
 */
export function getBrowsableEventsWhere() {
    return {
        isPublic: true
    };
}

/**
 * For counting events (shows, venue counts, band counts)
 * Excludes Studio Sessions and Errata from counts
 */
export function getCountableEventsWhere() {
    return {
        isPublic: true,
        eventType: {
            includeInStats: true
        }
    };
}

/**
 * For song performance counts and performance date lists
 * Excludes medleys, soundcheck sets, studio sessions, and errata
 */
export function getCountablePerformancesWhere() {
    return {
        isMedley: false,
        set: {
            setType: {
                includeInStats: true
            },
            event: {
                isPublic: true,
                eventType: {
                    includeInStats: true
                }
            }
        }
    };
}
