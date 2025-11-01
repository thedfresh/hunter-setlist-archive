// lib/utils/setlistVisibility.ts
// Centralized logic for determining what's visible in setlists and performance notes

export interface Performance {
    id: number;
    song: {
        title: string;
        slug?: string;
        leadVocals?: { id: number; name: string } | null;
        songTags?: Array<{ tag: { id: number; name: string } }>;
    } | null;
    leadVocals?: { id: number; name: string } | null;
    seguesInto?: boolean;
    isTruncatedStart?: boolean;
    isTruncatedEnd?: boolean;
    isPartial?: boolean;
    isUncertain?: boolean;
    isLyricalFragment?: boolean;
    isMusicalFragment?: boolean;
    isMedley?: boolean;
    publicNotes?: string | null;
    performanceMusicians?: Array<{
        id: string | number;
        musician: { name: string };
        instrument: { displayName: string };
    }>;
    isSoloHunter?: boolean;
}

export interface CollapsibleGroup {
    id: string;
    performances: Performance[];
    type: 'medley' | 'suite';
    suiteTag?: { id: number; name: string };
}

export type ViewMode = 'standard' | 'complete';


export const FRAGMENT_INDICATORS = {
    combined: { symbol: '§', label: 'Song fragment', cssClass: 'fragment-both' },
    lyrical: { symbol: '†', label: 'Lyrical fragment', cssClass: 'fragment-lyrical' },
    musical: { symbol: '‡', label: 'Instrumental fragment', cssClass: 'fragment-musical' },
    partial: { symbol: '※', label: 'Partial performance', cssClass: 'partial' }
} as const;

export interface FragmentIndicators {
    hasCombined: boolean;
    hasLyrical: boolean;
    hasMusical: boolean;
    hasPartial: boolean;
}
/**
 * Determines which fragment indicators should be visible for a single performance
 * This is the single source of truth for fragment visibility rules
 */
export function shouldShowFragmentIndicator(
    perf: Performance,
    viewMode: ViewMode
): { lyrical: boolean; musical: boolean; combined: boolean; partial: boolean } {
    const isLyrical = perf.isLyricalFragment === true;
    const isMusical = perf.isMusicalFragment === true;
    const isPartial = perf.isPartial === true;

    return {
        lyrical: viewMode === 'complete' && isLyrical && !isMusical,
        musical: viewMode === 'complete' && isMusical && !isLyrical,
        combined: viewMode === 'complete' && isLyrical && isMusical,
        partial: isPartial  // Shows in both Compact and Complete
    };
}
/**
 * Determines which fragment indicators appear in the legend
 * Based on what's actually visible in the setlist
 */
export function getFragmentIndicators(
    visiblePerformances: Performance[],
    viewMode: ViewMode
): FragmentIndicators {
    let hasCombined = false;
    let hasLyrical = false;
    let hasMusical = false;
    let hasPartial = false;

    visiblePerformances.forEach(perf => {
        const indicators = shouldShowFragmentIndicator(perf, viewMode);
        if (indicators.combined) hasCombined = true;
        if (indicators.lyrical) hasLyrical = true;
        if (indicators.musical) hasMusical = true;
        if (indicators.partial) hasPartial = true;
    });

    return { hasCombined, hasLyrical, hasMusical, hasPartial };
}
/**
 * Identifies medley groups in a list of performances
 * Medleys are consecutive performances where:
 * - All have isMedley = true
 * - All are connected by seguesInto = true
 */
export function identifyMedleyGroups(
    performances: Performance[],
    startCounter: number = 0
): CollapsibleGroup[] {
    const groups: CollapsibleGroup[] = [];
    let currentGroup: CollapsibleGroup | null = null;

    for (let i = 0; i < performances.length; i++) {
        const perf = performances[i];
        const prev = performances[i - 1];
        const continuesGroup = perf.isMedley && prev?.isMedley && prev?.seguesInto;
        const startsGroup = perf.isMedley && (!prev?.isMedley || !prev?.seguesInto);

        if (startsGroup) {
            currentGroup = {
                id: `medley-${startCounter + groups.length}`,
                performances: [perf],
                type: 'medley'
            };
            groups.push(currentGroup);
        } else if (continuesGroup && currentGroup) {
            currentGroup.performances.push(perf);
        } else {
            currentGroup = null;
        }
    }

    return groups.filter(g => g.performances.length >= 2);
}

/**
 * Identifies suite groups in a list of performances
 * Suites are consecutive performances where:
 * - 2+ performances share the same suite tag
 * - Connected by seguesInto = true
 * - Can include non-suite songs if they have isMedley = true and continue the segue chain
 */
export function identifySuiteGroups(
    performances: Performance[],
    startCounter: number = 0
): CollapsibleGroup[] {
    const groups: CollapsibleGroup[] = [];
    let currentGroup: CollapsibleGroup | null = null;
    let currentSuiteTag: { id: number; name: string } | null = null;

    for (let i = 0; i < performances.length; i++) {
        const perf = performances[i];
        const prev = performances[i - 1];
        const suiteTag = perf.song?.songTags?.find(
            (st: any) => st.tag.name.toLowerCase().includes('suite')
        )?.tag;

        if (suiteTag) {
            if (currentSuiteTag?.id === suiteTag.id && currentGroup) {
                // Continue current suite (no segue required for suite songs)
                currentGroup.performances.push(perf);
            } else {
                // Start new suite
                currentGroup = {
                    id: `suite-${startCounter + groups.length}`,
                    performances: [perf],
                    type: 'suite',
                    suiteTag: suiteTag
                };
                currentSuiteTag = suiteTag;
                groups.push(currentGroup);
            }
        } else if (currentGroup && perf.isMedley && prev?.seguesInto) {
            // Non-suite song in middle, but ONLY if it continues the segue chain
            currentGroup.performances.push(perf);
        } else {
            // Break current suite
            currentGroup = null;
            currentSuiteTag = null;
        }
    }

    return groups.filter(g => g.performances.length >= 3);
}

/**
 * Identifies all collapsible groups across multiple sets
 * Returns groups with globally unique IDs
 */
export function identifyAllGroups(
    sets: Array<{ performances: Performance[] }>
): CollapsibleGroup[] {
    const allGroups: CollapsibleGroup[] = [];
    let globalCounter = 0;

    sets.forEach(set => {
        const perfs = set.performances.filter(p => p.song);

        const medleys = identifyMedleyGroups(perfs, globalCounter);
        globalCounter += medleys.length;

        const suites = identifySuiteGroups(perfs, globalCounter);
        globalCounter += suites.length;

        allGroups.push(...medleys, ...suites);
    });

    return allGroups;
}

/**
 * Builds a map of performance ID -> group ID
 */
export function buildPerformanceToGroupMap(
    groups: CollapsibleGroup[]
): Map<number, string> {
    const map = new Map<number, string>();

    groups.forEach(group => {
        group.performances.forEach(perf => {
            map.set(perf.id, group.id);
        });
    });

    return map;
}


/**
 * Determines which performances should be visible based on:
 * - View mode (standard vs complete)
 * - Fragment filtering (standard mode only)
 * - Collapsed group state (standard mode only)
 */
export function getVisiblePerformances(
    allPerformances: Performance[],
    perfToGroupMap: Map<number, string>,
    expandedGroupIds: Set<string>,
    viewMode: ViewMode
): Performance[] {
    return allPerformances.filter(perf => {
        const groupId = perfToGroupMap.get(perf.id);

        // Complete view: show everything
        if (viewMode === 'complete') {
            return true;
        }

        // Standard view: apply filters

        // Filter 1: Hide fragments unless in expanded group
        if (perf.isLyricalFragment || perf.isMusicalFragment) {
            return groupId && expandedGroupIds.has(groupId);
        }

        // Filter 2: Hide performances in collapsed groups
        if (groupId && !expandedGroupIds.has(groupId)) {
            return false;
        }

        return true;
    });
}

/**
 * Builds a note map (note text -> number) for visible performances only
 * This ensures footnote numbers are sequential and only include visible notes
 */
export function buildVisibleNoteMap(
    visiblePerformances: Performance[]
): Map<string, number> {
    const noteMap = new Map<string, number>();
    let noteNum = 1;

    visiblePerformances.forEach(perf => {
        // Add publicNotes
        if (perf.publicNotes && perf.publicNotes.trim()) {
            const note = perf.publicNotes.trim();
            if (!noteMap.has(note)) {
                noteMap.set(note, noteNum);
                noteNum = noteNum + 1;
            }
        }

        // Add COMBINED performanceMusician note
        const musicianNote = generatePerformanceMusicianNote(perf.performanceMusicians);
        if (musicianNote && !noteMap.has(musicianNote)) {
            noteMap.set(musicianNote, noteNum);
            noteNum = noteNum + 1;
        }

        // Auto-generate note for solo Hunter flag
        if (perf.isSoloHunter) {
            const soloNote = "Hunter solo";
            if (!noteMap.has(soloNote)) {
                noteMap.set(soloNote, noteNum);
                noteNum = noteNum + 1;
            }
        }
    });

    return noteMap;
}

/**
 * Main function: calculates all visibility state for an event
 * This is called once by EventCard and results are passed to child components
 */
export function calculateSetlistVisibility(
    sets: Array<{ id: number; performances: Performance[] }>,
    expandedGroupIds: Set<string>,
    viewMode: ViewMode
) {
    // Step 1: Get all performances
    const allPerformances = sets.flatMap(set =>
        set.performances.filter(p => p.song)
    );

    // Step 2: Identify all groups
    const allGroups = identifyAllGroups(sets);

    // Step 3: Build performance -> group mapping
    const perfToGroupMap = buildPerformanceToGroupMap(allGroups);

    // Step 4: Determine visible performances
    const visiblePerformances = getVisiblePerformances(
        allPerformances,
        perfToGroupMap,
        expandedGroupIds,
        viewMode
    );

    // Step 5: Build note map for visible performances only
    const visibleNoteMap = buildVisibleNoteMap(visiblePerformances);

    const hasGuestLeadVocals = allPerformances.some(p => {
        const vocalist = p.leadVocals || p.song?.leadVocals;
        return vocalist && vocalist.name !== 'Robert Hunter';
    });

    return {
        allPerformances,
        allGroups,
        perfToGroupMap,
        visiblePerformances,
        visibleNoteMap,
        hasGuestLeadVocals
    };
}

/**
 * Generate collapsed label for a group
 * For medleys: unique song titles (excluding fragments) joined by " / "
 * For suites: suite name, plus any non-suite songs
 */
export function generateGroupLabel(group: CollapsibleGroup): string {
    if (group.type === 'medley') {
        const uniqueSongs = [...new Set(
            group.performances
                .filter(p => !p.isLyricalFragment && !p.isMusicalFragment)
                .map(p => p.song?.title)
                .filter(Boolean)
        )];
        return uniqueSongs.join(' / ');
    } else {
        // Suite - format display name
        const displayName = group.suiteTag?.name
            ?.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ') || 'Suite';

        const nonSuiteSongs = group.performances
            .filter(p => !p.song?.songTags?.some((st: any) => st.tag.id === group.suiteTag?.id))
            .map(p => p.song?.title)
            .filter(Boolean);

        if (nonSuiteSongs.length > 0) {
            return `${displayName} / ${nonSuiteSongs.join(' / ')}`;
        }

        return displayName;
    }
}

const INSTRUMENT_SORT_ORDER: { [key: string]: number } = {
    'guitar': 1,
    'keyboards': 2,
    'bass': 3,
    'drums': 4,
    'vocals': 5
};

function getInstrumentSortKey(displayName: string): number {
    const lower = displayName.toLowerCase();
    for (const [key, order] of Object.entries(INSTRUMENT_SORT_ORDER)) {
        if (lower.includes(key)) return order;
    }
    return 999; // Unknown instruments at end
}

export function generatePerformanceMusicianNote(
    performanceMusicians: Performance['performanceMusicians']
): string | null {
    if (!performanceMusicians || performanceMusicians.length === 0) {
        return null;
    }

    // Extract plain data first (avoid Prisma symbols)
    const plainMusicians = performanceMusicians.map(pm => ({
        musicianName: pm.musician?.name || '',
        instrumentName: pm.instrument?.displayName || ''
    }));

    // Sort by instrument priority, then alphabetically
    plainMusicians.sort((a, b) => {
        const orderA = getInstrumentSortKey(a.instrumentName);
        const orderB = getInstrumentSortKey(b.instrumentName);

        if (orderA !== orderB) return orderA - orderB;

        return a.musicianName.localeCompare(b.musicianName);
    });

    // Generate combined text
    const parts = plainMusicians
        .filter(pm => pm.musicianName && pm.instrumentName)
        .map(pm => `${pm.musicianName} on ${pm.instrumentName}`);

    return parts.length > 0 ? parts.join(', ') : null;
}