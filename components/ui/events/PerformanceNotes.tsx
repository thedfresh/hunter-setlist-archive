import React from 'react';
import { getGuestVocalsClass } from '@/lib/config/bands';
import { Performance, ViewMode } from '@/lib/utils/setlistVisibility';

interface PerformanceNotesProps {
  event?: any;
  viewMode: ViewMode;
  visibilityData: {
    allPerformances: Performance[];
    visiblePerformances: Performance[];
    visibleNoteMap: Map<string, number>;
  };
}

const PerformanceNotes: React.FC<PerformanceNotesProps> = ({
  event,
  viewMode,
  visibilityData
}) => {
  const { visiblePerformances, visibleNoteMap } = visibilityData;

  // Build array of unique notes with their numbers
  const uniqueNotes = Array.from(visibleNoteMap.entries())
    .sort((a, b) => a[1] - b[1])  // Sort by number
    .map(([note, num]) => ({ note, num }));

  // Detect if any VISIBLE performances have guest vocals
  const hasGuestVocals = visiblePerformances.some((perf: any) => {
    const vocalist = perf.leadVocals || perf.song?.leadVocals;
    return vocalist && vocalist.name !== 'Robert Hunter';
  });

  // Check which fragment indicators are used in VISIBLE performances (Complete view only)
  const hasLyricalFragment = viewMode === 'complete' && visiblePerformances.some(p => p.isLyricalFragment);
  const hasMusicalFragment = viewMode === 'complete' && visiblePerformances.some(p => p.isMusicalFragment);
  const hasPartial = viewMode === 'complete' && visiblePerformances.some(p => p.isPartial);
  const hasAnyFragments = hasLyricalFragment || hasMusicalFragment || hasPartial;

  if (uniqueNotes.length === 0 && !hasAnyFragments && !hasGuestVocals) return null;

  return (
    <div className="notes-section">
      {uniqueNotes.length > 0 && (
        <div className="notes-title">Performance Notes</div>
      )}

      {(hasAnyFragments || uniqueNotes.length > 0 || hasGuestVocals) && (
        <div className="notes-content">
          {hasGuestVocals && event && (
            <div className="mb-2">
              Note: <span className={getGuestVocalsClass(event.primaryBand?.name) || ''}>Colored song titles</span> indicate guest or alternate lead vocals.
            </div>
          )}
          {hasLyricalFragment && (
            <div className="mb-2">
              <span className="text-xs font-semibold inline-block w-4 text-center text-amber-900">†</span> Lyrical fragment or quote
            </div>
          )}
          {hasMusicalFragment && (
            <div className="mb-2">
              <span className="text-xs font-semibold inline-block w-4 text-center text-amber-900">‡</span> Musical/instrumental quote
            </div>
          )}
          {hasPartial && (
            <div className="mb-2">
              <span className="text-xs font-semibold inline-block w-4 text-center text-amber-900">§</span> Partial performance
            </div>
          )}
          {uniqueNotes.map(({ note, num }) => (
            <div key={num} className="mb-2">
              <span className="text-xs font-semibold inline-block w-4 text-center">[{num}]</span> {note}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PerformanceNotes;