import Markdown from '@/components/ui/Markdown';
import remarkGfm from 'remark-gfm';
import React from 'react';

interface StageTalkProps {
  sets: Array<{
    performances: Array<{
      song: { title: string } | null;
      showBanter: Array<{
        isBeforeSong: boolean;
        banterText: string;
      }>;
    }>;
  }>;
}

const StageTalk: React.FC<StageTalkProps> = ({ sets }) => {
  // 1. Flatten all banter entries from all sets/performances
  const banterEntries: Array<{
    songTitle: string;
    isBeforeSong: boolean;
    banterText: string;
  }> = [];

  sets.forEach(set => {
    set.performances.forEach(perf => {
      if (perf.song && perf.showBanter) {
        perf.showBanter.forEach(banter => {
          if (banter.banterText && banter.banterText.trim()) {
            banterEntries.push({
              songTitle: perf.song!.title,
              isBeforeSong: banter.isBeforeSong,
              banterText: banter.banterText.trim(),
            });
          }
        });
      }
    });
  });

  if (banterEntries.length === 0) return null;

  return (
    <div className="notes-section">
      <div className="notes-title">Stage Talk</div>
      {banterEntries.map((entry, idx) => (
        <div className="notes-content mb-3" key={idx}>
          <div className="banter-label font-semibold">
            {entry.isBeforeSong ? `Before ${entry.songTitle}:` : `After ${entry.songTitle}:`}
          </div>
          <div className="prose prose-sm max-w-none">
            <Markdown>
              {entry.banterText}
            </Markdown>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StageTalk;
