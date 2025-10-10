import React from 'react';


interface SetMusician {
  id: string | number;
  musician: { name: string };
  instrument: { displayName: string };
}

interface Band {
  id: string | number;
  name: string;
}

interface EventSetlistProps {
  sets: Array<{
    id: number;
    setType: { displayName: string };
    publicNotes?: string | null;
    bandId?: string | number | null;
    band?: Band | null;
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
  eventPrimaryBandId?: string | number | null;
}

const EventSetlist: React.FC<EventSetlistProps> = ({ sets, eventPrimaryBandId }) => {
  if (!sets || sets.length === 0) {
    return <div className="text-gray-500 text-sm italic">No known setlist</div>;
  }
  // Build noteMap in performance order: assign numbers as notes are encountered
  const noteMap = new Map<string, number>();
  let noteNum = 1;
  sets.forEach(set => {
    set.performances.forEach(perf => {
      // 1. Add publicNotes first, in order
      if (perf.publicNotes && perf.publicNotes.trim()) {
        const note = perf.publicNotes.trim();
        if (!noteMap.has(note)) {
          noteMap.set(note, noteNum++);
        }
      }
      // 2. Add performanceMusicians notes, in order
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

  return (
    <>
      <div className="notes-title font-semibold mb-1">Set List</div>
      <div className="rounded-lg p-2.5 border border-gray-100 bg-white/40">
        {sets.map((set, i) => {


          return (
            <section
              className={`set-section flex gap-3${i === 0 ? ' mt-0' : ' mt-3'}`}
              key={set.id}
            >
              <div className="set-label min-w-[80px] text-right">
                {set.setType?.displayName}
              </div>
              <div className="setlist flex-1">
                {/* Removed autoSetNote display, now handled in Show Notes section */}
                {set.publicNotes && (
                  <div className="set-note text-xs text-gray-600 italic mb-2">{set.publicNotes}</div>
                )}
                {(() => {
                  const perfs = set.performances.filter((perf) => perf.song);
                  // Build array of song objects for advanced comma logic
                  const songObjs: { str: string; truncatedStart: boolean; truncatedEnd: boolean; seguesInto?: boolean }[] = [];
                  for (let j = 0; j < perfs.length; j++) {
                    const perf = perfs[j];
                    let songStr = '';
                    // Song title as link if slug exists
                    if (perf.song?.slug) {
                      songStr = `<a href='/song/${perf.song.slug}' class='link-internal'>${perf.song.title}</a>`;
                    } else {
                      songStr = perf.song!.title;
                    }
                    const truncatedStart = !!perf.isTruncatedStart;
                    const truncatedEnd = !!perf.isTruncatedEnd;
                    if (truncatedStart) songStr = ` //${songStr}`;
                    if (truncatedEnd) songStr = `${songStr}// `;
                    // Collect all note numbers for this performance
                    const noteNumbers: number[] = [];
                    if (perf.publicNotes && perf.publicNotes.trim()) {
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
                    // Sort and append markers
                    noteNumbers.sort((a, b) => a - b);
                    noteNumbers.forEach(n => {
                      songStr += `<sup class='text-xs'>[${n}]</sup>`;
                    });
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
                  // Join, but no comma after a song with ' >' or adjacent to truncation
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
                  // Use dangerouslySetInnerHTML to render <sup> tags for footnotes
                  return <span dangerouslySetInnerHTML={{ __html: result }} />;
                })()}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
};

export default EventSetlist;
