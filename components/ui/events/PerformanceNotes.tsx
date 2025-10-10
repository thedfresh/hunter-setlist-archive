import React from 'react';

interface PerformanceMusician {
  musician: { name: string };
  instrument: { displayName: string };
}

interface PerformanceNotesProps {
  performances: Array<{
    id: number;
    publicNotes?: string | null;
    song: { title: string };
    performanceMusicians?: PerformanceMusician[];
  }>;
}

const PerformanceNotes: React.FC<PerformanceNotesProps> = ({ performances }) => {
  // Collect all notes: publicNotes and generated performanceMusicians notes
  type PerfNote = { perfId: number; note: string };
  const allNotes: PerfNote[] = [];

  for (const perf of performances) {
    if (perf.publicNotes && perf.publicNotes.trim()) {
      allNotes.push({ perfId: perf.id, note: perf.publicNotes.trim() });
    }
    if (perf.performanceMusicians && perf.performanceMusicians.length > 0) {
      perf.performanceMusicians.forEach(pm => {
        if (pm.musician?.name && pm.instrument?.displayName) {
          allNotes.push({
            perfId: perf.id,
            note: `${pm.musician.name} on ${pm.instrument.displayName}`,
          });
        }
      });
    }
  }

  if (allNotes.length === 0) return null;

  // Deduplicate notes and assign numbers
  const noteMap = new Map<string, number>();
  let noteNum = 1;
  for (const { note } of allNotes) {
    if (!noteMap.has(note)) {
      noteMap.set(note, noteNum++);
    }
  }

  // 3. Map performance id to footnote number (if needed elsewhere)
  // const perfToNoteNum = Object.fromEntries(allNotes.map(n => [n.perfId, noteMap.get(n.note)]));

  // 4. Render
  return (
    <div className="notes-section">
      <div className="notes-title">Performance Notes</div>
      {Array.from(noteMap.entries()).map(([note, num]) => (
        <div className="notes-content" key={num}>
          [{num}] {note}
        </div>
      ))}
    </div>
  );
};

export default PerformanceNotes;
