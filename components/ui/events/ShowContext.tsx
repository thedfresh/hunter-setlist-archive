import React from 'react';

interface ShowContextProps {
    event: any;
    showEventMusicians?: boolean;
    showSetBandContext?: boolean;
    showSetMusicians?: boolean;
    showPublicNotes?: boolean;
}


const ShowContext: React.FC<ShowContextProps> = ({
    event,
    showEventMusicians = true,
    showSetBandContext = true,
    showSetMusicians = true,
    showPublicNotes = true,
}) => {
    const hasEventMusicians = showEventMusicians && event.eventMusicians && event.eventMusicians.length > 0;
    const hasBandContext = showSetBandContext && event.sets && event.sets.some((set: any) => set.bandId && set.bandId !== event.primaryBandId && set.band);
    const hasSetMusicians = showSetMusicians && event.sets && event.sets.some((set: any) => set.setMusicians && set.setMusicians.length > 0);
    const hasPublicNotes = showPublicNotes && !!event.publicNotes;
    const showNotesSection = hasEventMusicians || hasBandContext || hasSetMusicians || hasPublicNotes;

    if (!showNotesSection) return null;

    return (
        <div className="notes-section">
            <div className="notes-title">Show Notes</div>
            {/* Event-level musicians */}
            {hasEventMusicians && (
                <div className="text-xs text-gray-700 mb-2">
                    With {event.eventMusicians
                        .filter((em: any) => em.musician && em.instrument)
                        .map((em: any) => `${em.musician.name} on ${em.instrument.name}`)
                        .join(', ')}
                </div>
            )}
            {/* Set band context lines */}
            {hasBandContext && event.sets && event.sets.length > 0 && event.sets.map((set: any, idx: number) => (
                (set.bandId && set.bandId !== event.primaryBandId && set.band) ? (
                    <div key={set.id} className="text-xs text-gray-700 mb-2">
                        Set {set.position ?? idx + 1} is {set.band.name === 'Robert Hunter' ? ` ${set.band.name} solo` : `${set.band.name}`}
                    </div>
                ) : null
            ))}
            {/* Set-level musicians */}
            {hasSetMusicians && event.sets && event.sets.length > 0 && event.sets.map((set: any, idx: number) => (
                (set.setMusicians && set.setMusicians.length > 0) ? (
                    <div key={set.id + '-musicians'} className="text-xs text-gray-700 mb-2">
                        Set {idx + 1}: with {set.setMusicians
                            .filter((sm: any) => sm.musician && sm.instrument)
                            .map((sm: any) => `${sm.musician.name} on ${sm.instrument.displayName}`)
                            .join(', ')}
                    </div>
                ) : null
            ))}
            {/* Public notes */}
            {hasPublicNotes && (
                <div className="notes-content">{event.publicNotes}</div>
            )}
        </div>
    );
};

export default ShowContext;
