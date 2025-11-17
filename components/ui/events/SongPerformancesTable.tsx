"use client";
import React from "react";
import Link from "next/link";
import { formatEventDate } from "@/lib/formatters/dateFormatter";
import { formatVenue } from "@/lib/formatters/venueFormatter";

export default function SongPerformancesTable({ performances }: { performances: any[] }) {
    const [gapSort, setGapSort] = React.useState<"asc" | "desc" | null>(null);
    const [dateSort, setDateSort] = React.useState<"asc" | "desc" | null>(null);

    let sorted = [...performances];
    if (gapSort) {
        sorted.sort((a, b) => {
            const gapA = a.gap ?? -1;
            const gapB = b.gap ?? -1;
            return gapSort === "asc" ? gapA - gapB : gapB - gapA;
        });
    } else if (dateSort) {
        sorted.sort((a, b) => {
            const aVal = a.set?.event;
            const bVal = b.set?.event;
            const aDate = aVal?.sortDate ? new Date(aVal.sortDate) : null;
            const bDate = bVal?.sortDate ? new Date(bVal.sortDate) : null;
            if (aDate && bDate && aDate.getTime() !== bDate.getTime()) return dateSort === "asc" ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
            if (a.set.position !== b.set.position) return dateSort === "asc" ? a.set.position - b.set.position : b.set.position - a.set.position;
            return dateSort === "asc" ? a.performanceOrder - b.performanceOrder : b.performanceOrder - a.performanceOrder;
        });
    } else {
        sorted.sort((a, b) => {
            const aVal = a.set?.event;
            const bVal = b.set?.event;
            const aDate = aVal?.sortDate ? new Date(aVal.sortDate) : null;
            const bDate = bVal?.sortDate ? new Date(bVal.sortDate) : null;
            if (aDate && bDate && aDate.getTime() !== bDate.getTime()) return aDate.getTime() - bDate.getTime();
            if (a.set.position !== b.set.position) return a.set.position - b.set.position;
            return a.performanceOrder - b.performanceOrder;
        });
    }

    return (
        <div className="overflow-x-auto">
            <h2>All Performances</h2>
            <p className="text-sm text-gray-600 mb-4">
                "Gap" is the count of shows with known setlists between performances, excluding studio sessions and guest appearances.
            </p>
            <table className="min-w-full text-sm border">
                <thead>
                    <tr className="bg-gray-100">
                        <th
                            className="px-2 py-1 text-left cursor-pointer select-none"
                            onClick={() => {
                                setDateSort(dateSort === "asc" ? "desc" : "asc");
                                setGapSort(null);
                            }}
                        >
                            Date
                            {dateSort === "asc" && <span> ▲</span>}
                            {dateSort === "desc" && <span> ▼</span>}
                        </th>
                        <th className="px-2 py-1 text-left">Venue</th>
                        <th className="px-2 py-1 text-left">Previous Song</th>
                        <th className="px-2 py-1 text-left">Next Song</th>
                        <th
                            className="px-2 py-1 text-left cursor-pointer select-none"
                            onClick={() => {
                                setGapSort(gapSort === "asc" ? "desc" : "asc");
                                setDateSort(null);
                            }}
                        >
                            Gap
                            {gapSort === "asc" && <span> ▲</span>}
                            {gapSort === "desc" && <span> ▼</span>}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((perf: any, idx: number, arr: any[]) => {
                        const setPerformances = perf.set.performances
                            ? [...perf.set.performances].sort((a: any, b: any) => a.performanceOrder - b.performanceOrder)
                            : [];
                        const perfIdx = setPerformances.findIndex((p: any) => p.id === perf.id);
                        const prevPerf = perfIdx > 0 ? setPerformances[perfIdx - 1] : null;
                        const nextPerf = perfIdx >= 0 && perfIdx < setPerformances.length - 1 ? setPerformances[perfIdx + 1] : null;

                        let showDateVenue = true;
                        if (idx > 0) {
                            const prev = arr[idx - 1];
                            if (prev.set.event.id === perf.set.event.id) {
                                showDateVenue = false;
                            }
                        }

                        const isNonCountable = perf.set.event.eventType && perf.set.event.eventType.includeInStats === false;

                        return (
                            <tr key={perf.id} className="border-t">
                                <td className="px-2 py-1">
                                    {showDateVenue ? (
                                        <Link href={`/event/${perf.set.event.slug}`} className="link-internal">
                                            {formatEventDate(perf.set.event)}
                                        </Link>
                                    ) : ""}
                                    {showDateVenue && isNonCountable && (
                                        <span className="ml-2 px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold align-middle">Studio</span>
                                    )}
                                </td>
                                <td className="px-2 py-1">
                                    {showDateVenue && perf.set.event.venue ? (
                                        perf.set.event.venue.slug ? (
                                            <Link href={`/venue/${perf.set.event.venue.slug}`} className="link-internal">
                                                {formatVenue(perf.set.event.venue)}
                                            </Link>
                                        ) : (
                                            <span>{formatVenue(perf.set.event.venue)}</span>
                                        )
                                    ) : ""}
                                </td>
                                <td className="px-2 py-1">
                                    {prevPerf ? (
                                        <>
                                            {prevPerf.isTruncatedEnd && <span className="text-xs text-gray-500">…</span>}
                                            {prevPerf.song?.slug ? (
                                                <Link href={`/song/${prevPerf.song.slug}`} className="link-internal">
                                                    {prevPerf.song.title}
                                                </Link>
                                            ) : (prevPerf.song?.title || "—")}
                                            {prevPerf.seguesInto && <span className="text-gray-500"> &gt; </span>}
                                        </>
                                    ) : "—"}
                                </td>
                                <td className="px-2 py-1">
                                    {nextPerf ? (
                                        <>
                                            {perf.isTruncatedStart && <span className="text-xs text-gray-500">…</span>}
                                            {perf.seguesInto && <span className="text-gray-500">&gt; </span>}
                                            {nextPerf.song?.slug ? (
                                                <Link href={`/song/${nextPerf.song.slug}`} className="link-internal">
                                                    {nextPerf.song.title}
                                                </Link>
                                            ) : (nextPerf.song?.title || "—")}
                                        </>
                                    ) : "—"}
                                </td>
                                <td className="px-2 py-1">
                                    {perf.gap !== null && perf.gap !== undefined ? perf.gap : "—"}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
