import React from 'react';
import ReactMarkdown from 'react-markdown';
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
            {/* Event-level musicians */}
            {hasEventMusicians && (
                <div
                    className="text-xs text-gray-700 mb-2"
                    dangerouslySetInnerHTML={{
                        __html: 'With ' + event.eventMusicians
                            .filter((em: any) => em.musician && em.instrument)
                            .map((em: any) => {
                                const name = em.musician.displayName || em.musician.name;
                                const slug = em.musician.slug;
                                let str = slug
                                    ? `<a href="/musician/${slug}" class="link-internal">${name}</a>`
                                    : name;
                                str += ` on ${em.instrument.name}`;
                                if (em.includesVocals) str += ' and vocals';
                                return str;
                            })
                            .join(', ')
                    }}
                />
            )}
            {/* Public notes */}
            {hasPublicNotes && (
                <div className="notes-content prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{event.publicNotes}</ReactMarkdown>
                </div>
            )}
        </div>
    );
};

export default ShowContext;
