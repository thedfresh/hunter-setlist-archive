
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
                            {dateRange && <div>Date Range: <span className="font-medium">{dateRange}</span></div>}
                        </div>
                    </div>
                    {musician.defaultInstrument && (
                        <div className="mb-8">
                            <h2 className="font-semibold text-lg mb-2">Default Instrument</h2>
                            <div className="text-sm text-gray-600">{musician.defaultInstrument.displayName}</div>
                        </div>
                    )}
                    {musician.bandMusicians && musician.bandMusicians.length > 0 && (
                        <div className="mb-8">
                            <h2 className="font-semibold text-lg mb-2">Band Memberships</h2>
                            <ul className="list-disc ml-6">
                                {musician.bandMusicians.map((bm: any) => (
                                    <li key={bm.id} className="mb-1">
                                        <Link href={`/band/${bm.band.slug}`} className="link-internal">
                                            {bm.band.displayName || bm.band.name}
                                        </Link>
                                        {bm.joinedDate && (
                                            <span className="ml-2 text-xs text-gray-600">Joined: {formatEventDate(bm.joinedDate)}</span>
                                        )}
                                        {bm.leftDate && (
                                            <span className="ml-2 text-xs text-gray-600">Left: {formatEventDate(bm.leftDate)}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
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
