import React from 'react';

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
        performances: Array<{
            id: number;
            song: { title: string; slug?: string } | null;
            performanceOrder: number;
            seguesInto?: boolean;
            isTruncatedStart?: boolean;
            isTruncatedEnd?: boolean;
            publicNotes?: string | null;
            performanceMusicians?: SetMusician[];
        }>;
    }>;
    showFootnotes?: boolean;
    showSongLinks?: boolean;
    eventPrimaryBandId?: string | number | null;
}

const Setlist: React.FC<SetlistProps> = ({
    sets,
    showFootnotes = false,
    showSongLinks = false,
    eventPrimaryBandId
}) => {
    if (!sets || sets.length === 0) {
        return <div className="text-gray-500 text-sm italic pt-2 -mb-2">No known setlist</div>;
    }

    // Build noteMap if footnotes are enabled
    const noteMap = new Map<string, number>();
    let noteNum = 1;

    if (showFootnotes) {
        sets.forEach(set => {
            set.performances.forEach(perf => {
                if (perf.publicNotes?.trim()) {
                    const note = perf.publicNotes.trim();
                    if (!noteMap.has(note)) {
                        noteMap.set(note, noteNum++);
                    }
                }
                if (perf.performanceMusicians && Array.isArray(perf.performanceMusicians)) {
                    perf.performanceMusicians.forEach(pm => {
                        if (pm.musician?.name && pm.instrument?.displayName) {
                            const musicianNote = `${pm.musician.name} on ${pm.instrument.displayName}`;
                            if (!noteMap.has(musicianNote)) {
                                noteMap.set(musicianNote, noteNum++);
                            }
                        }
                    });
                }
            });
        });
    }

    return (
        <div className="text-sm leading-loose text-gray-800">
            {sets.map((set, i) => {
                return (
                    <section
                        className={`set-section flex gap-3${i === 0 ? '' : ' mt-3'}`}
                        key={set.id}
                    >
                        <div className="set-label min-w-[80px] text-right font-semibold">
                            {set.setType?.displayName}
                        </div>
                        <div className="setlist flex-1">
                            {set.publicNotes && (
                                <div className="set-note text-xs text-gray-600 italic mb-2">{set.publicNotes}</div>
                            )}
                            {(() => {
                                const perfs = set.performances.filter((perf) => perf.song);
                                const songObjs: { str: string; truncatedStart: boolean; truncatedEnd: boolean; seguesInto?: boolean }[] = [];

                                for (let j = 0; j < perfs.length; j++) {
                                    const perf = perfs[j];
                                    let songStr = '';

                                    // Song title as link if enabled
                                    if (showSongLinks && perf.song?.slug) {
                                        songStr = `<a href='/song/${perf.song.slug}' class='link-internal'>${perf.song.title}</a>`;
                                    } else {
                                        songStr = perf.song!.title;
                                    }

                                    const truncatedStart = !!perf.isTruncatedStart;
                                    const truncatedEnd = !!perf.isTruncatedEnd;
                                    if (truncatedStart) songStr = ` //${songStr}`;
                                    if (truncatedEnd) songStr = `${songStr}// `;

                                    // Add footnotes if enabled
                                    if (showFootnotes) {
                                        const noteNumbers: number[] = [];
                                        if (perf.publicNotes?.trim()) {
                                            const n = noteMap.get(perf.publicNotes.trim());
                                            if (n) noteNumbers.push(n);
                                        }
                                        if (perf.performanceMusicians && Array.isArray(perf.performanceMusicians)) {
                                            perf.performanceMusicians.forEach(pm => {
                                                if (pm.musician?.name && pm.instrument?.displayName) {
                                                    const musicianNote = `${pm.musician.name} on ${pm.instrument.displayName}`;
                                                    const n = noteMap.get(musicianNote);
                                                    if (n) noteNumbers.push(n);
                                                }
                                            });
                                        }

                                        noteNumbers.sort((a, b) => a - b);
                                        noteNumbers.forEach(n => {
                                            songStr += `<sup class='text-xs'>[${n}]</sup>`;
                                        });
                                    }

                                    // Wrap entire song in non-breaking span
                                    songStr = `<span class="whitespace-nowrap">${songStr}</span>`;

                                    // Add separators OUTSIDE the non-breaking span
                                    if (perf.seguesInto) {
                                        songStr += ' > ';
                                    }

                                    songObjs.push({
                                        str: songStr,
                                        truncatedStart,
                                        truncatedEnd,
                                        seguesInto: perf.seguesInto,
                                    });
                                }
                                // Join with smart comma logic
                                let result = '';
                                for (let k = 0; k < songObjs.length; k++) {
                                    result += songObjs[k].str;
                                    const isLast = k === songObjs.length - 1;
                                    const thisTruncEnd = songObjs[k].truncatedEnd;
                                    const nextTruncStart = !isLast && songObjs[k + 1].truncatedStart;
                                    const thisSegues = songObjs[k].seguesInto;
                                    if (isLast) continue;
                                    if (thisSegues) continue;
                                    if (thisTruncEnd || nextTruncStart) continue;
                                    result += ', ';
                                }

                                return <span dangerouslySetInnerHTML={{ __html: result }} />;
                            })()}
                        </div>
                    </section>
                );
            })}
        </div>
    );
};

export default Setlist;