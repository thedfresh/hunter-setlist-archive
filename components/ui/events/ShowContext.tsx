import React from 'react';
import Markdown from '@/components/ui/Markdown';
import remarkGfm from 'remark-gfm';

interface ShowContextProps {
    event: any;
    showEventMusicians?: boolean;
    showSetBandContext?: boolean;
    showSetMusicians?: boolean;
    showPublicNotes?: boolean;
    hasGuestLeadVocals?: boolean;
}


const ShowContext: React.FC<ShowContextProps> = ({
    event,
    showEventMusicians = true,
    showSetBandContext = true,
    showSetMusicians = true,
    showPublicNotes = true,
    hasGuestLeadVocals = false,
}) => {
    const hasEventMusicians = showEventMusicians && event.eventMusicians?.length > 0;
    const hasPublicNotes = showPublicNotes && event.publicNotes;
    const hasAnyContent = hasEventMusicians || hasPublicNotes || hasGuestLeadVocals;
    if (!hasAnyContent) return null;

    return (
        <div className="notes-section">
            <div className="notes-title">Show Notes</div>
            {hasEventMusicians && (
                <div className="text-xs text-gray-700 mb-2">
                    With {event.eventMusicians
                        .filter((em: any) => em.musician)
                        .map((em: any, idx: number) => {
                            const name = em.musician.displayName || em.musician.name;
                            const slug = em.musician.slug;
                            const instruments = em.instruments?.map((i: any) => i.instrument.displayName).filter(Boolean) || [];

                            return (
                                <React.Fragment key={em.id}>
                                    {slug ? (
                                        <a href={`/musician/${slug}`} className="link-internal">{name}</a>
                                    ) : (
                                        name
                                    )}
                                    {instruments.length > 0 && ` on ${instruments.join(', ')}`}
                                    {idx < event.eventMusicians.length - 1 && ', '}
                                </React.Fragment>
                            );
                        })}
                </div>
            )}
            {/* Public notes */}
            {hasPublicNotes && (
                <div className="notes-content prose prose-sm max-w-none">
                    <Markdown>{event.publicNotes}</Markdown>
                </div>
            )}
        </div>
    );
};

export default ShowContext;
