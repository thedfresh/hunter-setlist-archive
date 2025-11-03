import Markdown from '@/components/ui/Markdown';
import remarkGfm from 'remark-gfm';
import React, { useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { getGuestVocalsClass } from '@/lib/config/bands';
import {
    Performance,
    CollapsibleGroup,
    ViewMode,
    generateGroupLabel,
    generatePerformanceMusicianNote,
    shouldShowFragmentIndicator
} from '@/lib/utils/setlistVisibility';

interface SetMusician {
    id: string | number;
    musician: { name: string };
    instrument: { displayName: string };
}

interface SetlistProps {
    sets: Array<{
        id: number;
        setType: { displayName: string };
        publicNotes?: string | null;
        bandId?: string | number | null;
        band?: { id: string | number; name: string } | null;
        setMusicians?: SetMusician[];
        performances: Performance[];
        isUncertain?: boolean;
    }>;
    showFootnotes?: boolean;
    showSongLinks?: boolean;
    event?: {
        primaryBand?: {
            name: string;
        } | null;
    };
    viewMode: ViewMode;
    expandedGroups: Set<string>;
    setExpandedGroups: (groups: Set<string>) => void;
    visibilityData: {
        allPerformances: Performance[];
        allGroups: CollapsibleGroup[];
        perfToGroupMap: Map<number, string>;
        visiblePerformances: Performance[];
        visibleNoteMap: Map<string, number>;
    };
}

const Setlist: React.FC<SetlistProps> = ({
    sets,
    showFootnotes = false,
    showSongLinks = false,
    event,
    viewMode,
    expandedGroups,
    setExpandedGroups,
    visibilityData
}) => {
    const { allGroups, perfToGroupMap, visibleNoteMap } = visibilityData;

    // Reset expanded state when view mode changes
    useEffect(() => {
        if (viewMode === 'complete') {
            // Expand all groups
            const allGroupIds = new Set(allGroups.map(g => g.id));
            setExpandedGroups(allGroupIds);
        } else if (viewMode === 'standard' && expandedGroups.size > 0) {
            // Only collapse if something is expanded
            setExpandedGroups(new Set());
        }
    }, [viewMode]);

    if (!sets || sets.length === 0) {
        return <div className="text-gray-500 text-sm italic pt-2 -mb-2">No known setlist</div>;
    }

    function getGuestVocalsClassForPerformance(performance: Performance, event: any): string | null {
        const vocalist = performance.leadVocals || performance.song?.leadVocals;
        if (!vocalist || vocalist.name === 'Robert Hunter') {
            return null;
        }
        return getGuestVocalsClass(event?.primaryBand?.name);
    }

    const getFragmentClass = (perf: Performance): string => {
        const classes: string[] = [];

        if (perf.isUncertain) classes.push('uncertain');

        const indicators = shouldShowFragmentIndicator(perf, viewMode);

        if (indicators.combined) classes.push('fragment-both');
        if (indicators.lyrical) classes.push('fragment-lyrical');
        if (indicators.musical) classes.push('fragment-musical');
        if (indicators.partial) classes.push('partial');

        return classes.join(' ');
    };

    function toggleGroup(groupId: string) {
        const next = new Set(expandedGroups);
        if (next.has(groupId)) {
            next.delete(groupId);
        } else {
            next.add(groupId);
        }
        setExpandedGroups(next);
    }

    // Get footnote numbers for a performance
    function getFootnoteNumbers(perf: Performance): number[] {
        if (!showFootnotes || viewMode !== 'complete') return [];

        const numbers: number[] = [];

        if (perf.publicNotes && perf.publicNotes.trim()) {
            const n = visibleNoteMap.get(perf.publicNotes.trim());
            if (n) {
                numbers.push(n);
            }
        }


        // Get COMBINED musician note
        const musicianNote = generatePerformanceMusicianNote(perf.performanceMusicians);
        if (musicianNote) {
            const n = visibleNoteMap.get(musicianNote);
            if (n) {
                numbers.push(n);
            }
        }

        // Check for solo Hunter flag
        if (perf.isSoloHunter) {
            const soloNote = "Hunter solo";
            const n = visibleNoteMap.get(soloNote);
            if (n) {
                numbers.push(n);
            }
        }

        return numbers.sort((a, b) => a - b);
    }

    function renderGroup(group: CollapsibleGroup, isLastInSet: boolean) {
        const isExpanded = expandedGroups.has(group.id);
        const label = generateGroupLabel(group);

        // Find footnotes that apply to ALL songs in group (only for collapsed view)
        const groupFootnotes: number[] = [];

        if (!isExpanded && showFootnotes && viewMode === 'complete') {
            // Check each possible note in the visible note map
            visibleNoteMap.forEach((num, note) => {
                // Count how many performances in this group have this exact note
                let perfsWithNote = 0;

                for (const perf of group.performances) {
                    let hasNote = false;

                    // Check publicNotes
                    if (perf.publicNotes && perf.publicNotes.trim() === note) {
                        hasNote = true;
                    }

                    // Check performanceMusicians using COMBINED note
                    if (!hasNote) {
                        const perfMusicianNote = generatePerformanceMusicianNote(perf.performanceMusicians);
                        if (perfMusicianNote === note) {
                            hasNote = true;
                        }
                    }

                    if (hasNote) {
                        perfsWithNote = perfsWithNote + 1;
                    }
                }

                // If ALL performances have this note, it's a group-level footnote
                if (perfsWithNote === group.performances.length) {
                    groupFootnotes.push(num);
                }
            });
        }

        if (viewMode === 'complete') {
            return group.performances.map((perf, idx) =>
                renderSong(perf, idx, group.performances, null, idx === group.performances.length - 1)
            );
        }

        return (
            <span key={group.id} className="collapsible-wrapper">
                <span className="collapsible-content">
                    {!isExpanded && (
                        <span className="collapsed-label">
                            {label}
                            {groupFootnotes.sort((a, b) => a - b).map(n => (
                                <sup key={n} className="text-xs">[{n}]</sup>
                            ))}
                        </span>
                    )}
                    <span className={isExpanded ? 'expanded-content' : 'collapsed-content'}>
                        {group.performances.map((perf, idx) =>
                            renderSong(perf, idx, group.performances, group.id, idx === group.performances.length - 1)
                        )}
                    </span>
                </span>
                <span
                    className="collapse-icon"
                    onClick={() => toggleGroup(group.id)}
                    title={isExpanded ? 'Click to collapse' : 'Click to expand'}
                >
                    {isExpanded ? '▲' : '▼'}
                </span>
            </span>
        );
    }


    // Helper: Find next visible performance (skipping hidden fragments)
    function findNextVisiblePerformance(index: number, performances: Performance[], viewMode: string, perfToGroupMap: Map<number, string>) {
        for (let i = index + 1; i < performances.length; i++) {
            const perf = performances[i];
            // In standard mode, skip fragments not in a group
            if (
                viewMode === 'standard' &&
                (perf.isLyricalFragment || perf.isMusicalFragment) &&
                !perfToGroupMap.get(perf.id)
            ) {
                continue;
            }
            return perf;
        }
        return null;
    }

    function renderSong(
        perf: Performance,
        index: number,
        performances: Performance[],
        groupId: string | null,
        isLastInGroup: boolean = false
    ) {
        if (!perf.song) return null;

        const fragmentClass = getFragmentClass(perf);
        const guestVocalsClass = getGuestVocalsClassForPerformance(perf, event);
        const allClasses = [fragmentClass, guestVocalsClass].filter(Boolean).join(' ');

        const vocalist = perf.leadVocals || perf.song?.leadVocals;
        const tooltipText = vocalist && vocalist.name !== 'Robert Hunter'
            ? `Lead vocals: ${vocalist.name}`
            : undefined;

        const footnotes = getFootnoteNumbers(perf);
        const isLast = index === performances.length - 1;
        const nextVisiblePerf = findNextVisiblePerformance(index, performances, viewMode, perfToGroupMap);

        let separator = '';
        if (!isLast && !isLastInGroup && nextVisiblePerf) {
            if (perf.seguesInto) {
                separator = '>';
            } else if (perf.isTruncatedEnd || nextVisiblePerf.isTruncatedStart) {
                separator = '';
            } else {
                separator = ',';
            }
        }

        return (
            <React.Fragment key={perf.id}>
                <span className="whitespace-nowrap inline-block">
                    <span className={allClasses} title={tooltipText}>
                        {perf.isTruncatedStart && '// '}
                        {showSongLinks && perf.song.slug ? (
                            <a href={`/song/${perf.song.slug}`} className="link-internal">
                                {perf.song.title}
                            </a>
                        ) : (
                            perf.song.title
                        )}
                        {perf.isTruncatedEnd && ' //'}
                        {footnotes.map(n => (
                            <sup key={n} className="text-xs">[{n}]</sup>
                        ))}
                    </span>
                    {separator === '>' && ' '}
                    {separator}
                    {separator && ' '}
                </span>
                {!isLastInGroup && ' '}
            </React.Fragment>
        );
    }

    function renderPerformances(performances: Performance[], setIndex: number) {
        // Get groups for this set only
        const setGroups = allGroups.filter(group =>
            performances.some(p => group.performances.some(gp => gp.id === p.id))
        );

        const result: React.ReactNode[] = [];
        let i = 0;

        while (i < performances.length) {
            const perf = performances[i];
            const groupId = perfToGroupMap.get(perf.id);
            const group = setGroups.find(g => g.id === groupId);

            // Check if this is the first performance in a group
            const isFirstInGroup = group && performances.indexOf(perf) === performances.indexOf(group.performances[0]);

            if (isFirstInGroup) {
                // Render the entire group (collapsed or expanded)
                const isLastGroup = (i + group.performances.length) === performances.length;
                const lastPerfInGroup = group.performances[group.performances.length - 1];

                result.push(
                    <React.Fragment key={group.id}>
                        {renderGroup(group, isLastGroup)}
                        {!isLastGroup && (
                            <>
                                {lastPerfInGroup.seguesInto && ' '}
                                {lastPerfInGroup.seguesInto ? '>' : ','}
                                {' '}
                            </>
                        )}
                    </React.Fragment>
                );
                i += group.performances.length;
            } else if (!group) {
                // Not in a group - check if we should skip fragments
                if (viewMode === 'standard' && (perf.isLyricalFragment || perf.isMusicalFragment)) {
                    i++;
                    continue;
                }
                result.push(renderSong(perf, i, performances, null, false));
                i++;
            } else {
                // In a group but not the first performance - already handled by group render
                i++;
            }
        }

        return result;
    }

    // Count encore sets
    const encoreSets = sets.filter((s: any) =>
        s.setType?.displayName.toLowerCase().includes('encore')
    );
    const hasMultipleEncores = encoreSets.length > 1;

    return (
        <div className="text-sm leading-loose text-gray-800">
            {sets.map((set, i) => {
                const perfs = set.performances.filter((perf) => perf.song);
                const isEncore = set.setType?.displayName.toLowerCase().includes('encore');

                // Generate encore label (E:, E1:, E2:)
                let encoreLabel = '';
                if (isEncore) {
                    if (hasMultipleEncores) {
                        const encoreNum = encoreSets.findIndex((s: any) => s.id === set.id) + 1;
                        encoreLabel = `E${encoreNum}:`;
                    } else {
                        encoreLabel = 'E:';
                    }
                }

                return (
                    <section
                        className={`set-section${i === 0 ? '' : ' mt-4'}`}
                        key={set.id}
                    >
                        {/* Regular sets: header on own line */}
                        {!isEncore && (
                            <div className="font-semibold text-gray-900 mb-2">
                                {set.setType?.displayName || `Set ${i + 1}`}
                                {set.isUncertain && (
                                    <span className="badge-uncertain-small ml-1" title="Set order uncertain">
                                        ?
                                    </span>
                                )}
                                {set.bandId && set.band && set.band.name !== event?.primaryBand?.name && (
                                    <span className="text-gray-600 font-normal text-xs ml-2">
                                        ({set.band.name === 'Robert Hunter' ? 'Robert Hunter solo' : set.band.name})
                                    </span>
                                )}
                                {set.setMusicians && set.setMusicians.length > 0 && (
                                    <span className="text-gray-600 font-normal text-xs ml-2" dangerouslySetInnerHTML={{
                                        __html: `(with ${set.setMusicians
                                            .filter((sm: any) => sm.musician && sm.instrument)
                                            .map((sm: any) => {
                                                const name = sm.musician.displayName || sm.musician.name;
                                                const slug = sm.musician.slug;
                                                let str = slug
                                                    ? `<a href="/musician/${slug}" class="link-internal">${name}</a>`
                                                    : name;
                                                str += ` on ${sm.instrument.displayName}`;
                                                if (sm.includesVocals) str += ' and vocals';
                                                return str;
                                            })
                                            .join(', ')})`
                                    }} />
                                )}
                            </div>
                        )}

                        {/* Set notes */}
                        {set.publicNotes && (
                            <div className="set-note text-xs text-gray-600 italic mb-2 prose prose-sm max-w-none">
                                <Markdown>{set.publicNotes}</Markdown>
                            </div>
                        )}

                        {/* Songs */}
                        <div className="setlist">
                            {/* Encore: inline label */}
                            {isEncore && (
                                <span className="font-semibold text-gray-900 mr-1">
                                    {encoreLabel}
                                </span>
                            )}
                            {renderPerformances(perfs, i)}
                        </div>
                    </section>
                );
            })}
        </div>
    );
};

export default Setlist;
