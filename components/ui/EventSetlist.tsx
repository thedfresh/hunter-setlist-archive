import React from 'react';


interface EventSetlistProps {
  sets: Array<{
    id: number;
    setType: { displayName: string };
    publicNotes?: string | null;
    performances: Array<{
      id: number;
      song: { title: string } | null;
      performanceOrder: number;
      seguesInto?: boolean;
      isTruncatedStart?: boolean;
      isTruncatedEnd?: boolean;
      publicNotes?: string | null;
    }>;
  }>;
}

const EventSetlist: React.FC<EventSetlistProps> = ({ sets }) => {
  // Build footnote mapping for all performances
  const noteMap = new Map<string, number>();
  let noteNum = 1;
  sets.forEach(set => {
    set.performances.forEach(perf => {
      if (perf.publicNotes && perf.publicNotes.trim() && !noteMap.has(perf.publicNotes.trim())) {
        noteMap.set(perf.publicNotes.trim(), noteNum++);
      }
    });
  });

  return (
    <>
      <div className="notes-title font-semibold mb-1">Set List</div>
      <div className="rounded-lg p-2.5 border border-gray-100 bg-white/40">
        {sets.map((set, i) => (
          <section
            className={`set-section flex gap-3${i === 0 ? ' mt-0' : ' mt-3'}`}
            key={set.id}
          >
            <div className="set-label min-w-[80px] text-right">
              {set.setType?.displayName}
            </div>
            <div className="setlist flex-1">
              {set.publicNotes && (
                <div className="set-note text-xs text-gray-600 italic mb-2">{set.publicNotes}</div>
              )}
              {(() => {
                const perfs = set.performances.filter((perf) => perf.song);
                // Build array of song objects for advanced comma logic
                const songObjs: { str: string; truncatedStart: boolean; truncatedEnd: boolean; seguesInto?: boolean }[] = [];
                for (let j = 0; j < perfs.length; j++) {
                  const perf = perfs[j];
                  let songStr = perf.song!.title;
                  const truncatedStart = !!perf.isTruncatedStart;
                  const truncatedEnd = !!perf.isTruncatedEnd;
                  if (truncatedStart) songStr = ` //${songStr}`;
                  if (truncatedEnd) songStr = `${songStr}// `;
                  if (perf.publicNotes && perf.publicNotes.trim()) {
                    const n = noteMap.get(perf.publicNotes.trim());
                    if (n) songStr += `<sup class='text-xs'>[${n}]</sup>`;
                  }
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
        ))}
      </div>
    </>
  );
};

export default EventSetlist;
