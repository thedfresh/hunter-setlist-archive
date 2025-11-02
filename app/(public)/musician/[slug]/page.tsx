
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getMusicianBySlug } from "@/lib/queries/musicianBrowseQueries";
import { formatEventDate } from "@/lib/formatters/dateFormatter";
import { PageContainer } from "@/components/ui/PageContainer";

export const dynamic = "force-dynamic";

export default async function MusicianDetailPage({ params }: { params: { slug: string } }) {
    const musician = await getMusicianBySlug(params.slug);
    if (!musician) return notFound();

    // Stats
    const allEventDates = musician.events?.map(e => e.event.displayDate).filter(Boolean) || [];
    const appearanceCount = musician.events?.length || 0;
    const dateRange = allEventDates.length
        ? `${formatEventDate(allEventDates[allEventDates.length - 1])} – ${formatEventDate(allEventDates[0])}`
        : null;

    // Display name logic
    const displayName = (musician as any).displayName
        || ((musician as any).firstName && (musician as any).lastName ? `${(musician as any).firstName} ${(musician as any).lastName}` : (musician as any).name);

    return (
        <PageContainer>
            <h1 className="page-title mb-8">{displayName}</h1>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-8 mb-8">
                {/* LEFT COLUMN: Stats, Bands, Instrument */}
                <div className="pr-0 md:pr-8 md:border-r border-gray-200">
                    <div className="mb-8">
                        <h2 className="font-semibold text-lg mb-2">Statistics</h2>
                        <div className="text-sm text-gray-600 space-y-1">
                            <div>Total Appearances: <span className="font-medium">{appearanceCount}</span></div>
                        </div>
                    </div>
                    {musician.defaultInstrument && (
                        <div className="mb-8">
                            <h2 className="font-semibold text-lg mb-2">Instrument</h2>
                            <div className="text-sm text-gray-600">{musician.defaultInstrument.displayName}</div>
                        </div>
                    )}
                    {musician.bandMusicians && musician.bandMusicians.length > 0 && (
                        <div className="mb-8">
                            <h2 className="font-semibold text-lg mb-2">Band Memberships</h2>
                            <div className="space-y-4">
                                {musician.bandMusicians.map((bm: any) => (
                                    <div key={bm.id}>
                                        <div>
                                            <Link href={`/band/${bm.band.slug}`} className="link-internal">
                                                {bm.band.displayName || bm.band.name}
                                            </Link>
                                        </div>
                                        <div className="text-xs text-gray-600 mt-2">
                                            {bm.joinedDate && (
                                                <span>
                                                    Joined: {new Date(bm.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                                </span>
                                            )}
                                            {bm.joinedDate && bm.leftDate && <span className="mx-2">•</span>}
                                            {bm.leftDate && (
                                                <span>
                                                    Left: {new Date(bm.leftDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                {/* RIGHT COLUMN: Notes (if any) */}
                <div>
                    {musician.publicNotes && (
                        <section>
                            <div className="font-semibold text-lg mb-2">Notes</div>
                            <div className="prose prose-sm max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {musician.publicNotes}
                                </ReactMarkdown>
                            </div>
                        </section>
                    )}
                </div>
            </div>
            {/* FULL WIDTH: Performances Table */}
            <div className="mb-8">
                <h2 className="font-semibold text-lg mb-2">Performances</h2>
                {musician.events && musician.events.length > 0 ? (
                    <div className="table-container">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th className="text-left">Date</th>
                                    <th className="text-left">Venue</th>
                                    <th className="text-left">Band</th>
                                    <th className="text-left">Instruments / Vocals</th>
                                </tr>
                            </thead>
                            <tbody>
                                {musician.events.map((ev: any) => (
                                    <tr key={ev.event.id}>
                                        <td>
                                            <Link href={`/event/${ev.event.slug}`} className="link-internal">
                                                {ev.event.displayDate
                                                    ? formatEventDate(ev.event.displayDate)
                                                    : ev.event.year
                                                        ? formatEventDate({
                                                            year: ev.event.year,
                                                            month: ev.event.month || 1,
                                                            day: ev.event.day || 1
                                                        })
                                                        : 'Date Unknown'}
                                            </Link>
                                        </td>
                                        <td>{ev.event.venue?.name}</td>
                                        <td>{ev.event.primaryBand?.name || ""}</td>
                                        <td>
                                            <ul className="list-none p-0 m-0">
                                                {ev.appearances.map((app: any, idx: number) => (
                                                    <li key={idx} className="text-sm">
                                                        {app.type === "performance" && app.song ? (
                                                            <span><strong>{app.song}:</strong> {app.instrument}{app.includesVocals && " and vocals"}</span>
                                                        ) : app.type === "set" ? (
                                                            <span>Full set: {app.instrument}{app.includesVocals && " and vocals"}</span>
                                                        ) : (
                                                            <span>Full show: {app.instrument}{app.includesVocals && " and vocals"}</span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">No performances found.</div>
                )}
            </div>
        </PageContainer>
    );
}
