import React from 'react';
import { getGuestVocalsClass } from '@/lib/config/bands';
import { Performance, ViewMode } from '@/lib/utils/setlistVisibility';
import { getFragmentIndicators, FRAGMENT_INDICATORS } from '@/lib/utils/setlistVisibility';

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
  const fragmentIndicators = getFragmentIndicators(visiblePerformances, viewMode);

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
          {(fragmentIndicators.hasCombined || fragmentIndicators.hasLyrical || fragmentIndicators.hasMusical || fragmentIndicators.hasPartial) && (
            <div className="text-sm text-gray-600 mb-3">
              {fragmentIndicators.hasCombined && <div>{FRAGMENT_INDICATORS.combined.symbol} = {FRAGMENT_INDICATORS.combined.label}</div>}
              {fragmentIndicators.hasLyrical && <div>{FRAGMENT_INDICATORS.lyrical.symbol} = {FRAGMENT_INDICATORS.lyrical.label}</div>}
              {fragmentIndicators.hasMusical && <div>{FRAGMENT_INDICATORS.musical.symbol} = {FRAGMENT_INDICATORS.musical.label}</div>}
              {fragmentIndicators.hasPartial && <div>{FRAGMENT_INDICATORS.partial.symbol} = {FRAGMENT_INDICATORS.partial.label}</div>}
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