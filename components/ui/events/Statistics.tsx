import React from 'react';
import Link from 'next/link';

interface StatisticsProps {
    stats?: {
        firstPerformances: Array<{ songId: number; songTitle: string; songSlug: string }>;
        lastPerformances: Array<{ songId: number; songTitle: string; songSlug: string }>;
        onlyPerformances: Array<{ songId: number; songTitle: string; songSlug: string }>;
        comebacks: Array<{ songId: number; songTitle: string; songSlug: string; gap: number }>;
    };
}

export default function Statistics({ stats }: StatisticsProps) {
    if (!stats) return null;
    const { firstPerformances, lastPerformances, onlyPerformances, comebacks } = stats;
    const hasStats = Boolean(
        (firstPerformances && firstPerformances.length) ||
        (lastPerformances && lastPerformances.length) ||
        (onlyPerformances && onlyPerformances.length) ||
        (comebacks && comebacks.length)
    );
    if (!hasStats) return null;

    return (
        <section className="notes-section">
            <div className="notes-title">Statistics <span className="text-xs text-red-600">[Experimental!]</span></div>
            <div className="notes-content space-y-4">
                {firstPerformances && firstPerformances.length > 0 && (
                    <div>
                        <div className="notes-label">
                            First Documented Performance{firstPerformances.length > 1 ? 's' : ''}
                        </div>
                        <div className="notes-value">
                            {firstPerformances.map((song, i) => (
                                <span key={song.songId}>
                                    {i > 0 && ', '}
                                    <Link href={`/song/${song.songSlug}`} className="link-internal">
                                        {song.songTitle}
                                    </Link>
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                {onlyPerformances && onlyPerformances.length > 0 && (
                    <div>
                        <div className="notes-label">
                            Only Documented Performance{onlyPerformances.length > 1 ? 's' : ''}
                        </div>
                        <div className="notes-value">
                            {onlyPerformances.map((song, i) => (
                                <span key={song.songId}>
                                    {i > 0 && ', '}
                                    <Link href={`/song/${song.songSlug}`} className="link-internal">
                                        {song.songTitle}
                                    </Link>
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                {lastPerformances && lastPerformances.length > 0 && (
                    <div>
                        <div className="notes-label">
                            Final Documented Performance{lastPerformances.length > 1 ? 's' : ''}
                        </div>
                        <div className="notes-value">
                            {lastPerformances.map((song, i) => (
                                <span key={song.songId}>
                                    {i > 0 && ', '}
                                    <Link href={`/song/${song.songSlug}`} className="link-internal">
                                        {song.songTitle}
                                    </Link>
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                {comebacks && comebacks.length > 0 && (
                    <div>
                        <div className="notes-label">Comebacks (gap ≥ 50 shows with known setlists)</div>
                        <div className="notes-value">
                            {comebacks.map((song, i) => (
                                <span key={song.songId}>
                                    {i > 0 && ', '}
                                    <Link href={`/song/${song.songSlug}`} className="link-internal">
                                        {song.songTitle}
                                    </Link>
                                    <span className="notes-gap"> ({song.gap} shows)</span>
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
