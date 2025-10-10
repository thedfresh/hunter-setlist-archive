import React from 'react';

export default function Setlist({ sets }: { sets: any[] }) {
    if (!sets || sets.length === 0) {
        return <div className="text-gray-500 text-sm italic">No known setlist</div>;
    }
    return (
        <div className="text-sm leading-loose text-gray-800 setlist space-y-2">
            {sets.map((set, i) => (
                <div key={set.id} className="space-y-2">
                    <span className="font-semibold">{set.setType?.displayName || `Set ${i + 1}`}:</span>{' '}
                    {set.performances.map((perf: any, idx: number) => (
                        <span key={perf.id}>
                            {perf.song?.title || '—'}
                            {perf.seguesInto ? ' > ' : (idx < set.performances.length - 1 ? ', ' : '')}
                        </span>
                    ))}
                </div>
            ))}
        </div>
    );
}
