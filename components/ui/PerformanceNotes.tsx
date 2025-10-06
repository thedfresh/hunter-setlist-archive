import React from 'react';

interface PerformanceNotesProps {
  performances: Array<{
    id: number;
    publicNotes?: string | null;
    song: { title: string };
  }>;
}

const PerformanceNotes: React.FC<PerformanceNotesProps> = ({ performances }) => {
  // 1. Filter performances with notes
  const noted = performances.filter((p) => p.publicNotes && p.publicNotes.trim());
  if (noted.length === 0) return null;

  // 2. Map for unique notes
  const noteMap = new Map<string, number>();
  let noteNum = 1;
  for (const perf of noted) {
    const note = perf.publicNotes!.trim();
    if (!noteMap.has(note)) {
      noteMap.set(note, noteNum++);
    }
  }

  // 3. Map performance id to footnote number (if needed elsewhere)
  // const perfToNoteNum = Object.fromEntries(noted.map(p => [p.id, noteMap.get(p.publicNotes!.trim())]));

  // 4. Render
  return (
    <div className="notes-section pt-5 border-t mt-8">
      <div className="notes-title font-semibold mb-1">Performance Notes</div>
      {Array.from(noteMap.entries()).map(([note, num]) => (
        <div className="notes-content" key={num}>
          [{num}] {note}
        </div>
      ))}
    </div>
  );
};

export default PerformanceNotes;
