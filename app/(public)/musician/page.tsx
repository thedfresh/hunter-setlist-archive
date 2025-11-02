"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { PageContainer } from '@/components/ui/PageContainer';
import { getMusiciansBrowse } from "@/lib/queries/musicianBrowseQueries";
import { compareDates } from "@/lib/utils/dateSort";

export const dynamic = "force-dynamic";



function MusicianBrowsePageClient() {
    const [musicians, setMusicians] = useState<any[]>([]);
    const [sortField, setSortField] = useState<'name' | 'instrument' | 'bands' | 'appearances'>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        async function fetchMusicians() {
            const res = await fetch("/api/musicians");
            const data = await res.json();
            setMusicians(data.musicians || []);
        }
        fetchMusicians();
    }, []);

    const sortedMusicians = Array.isArray(musicians)
        ? [...musicians].sort((a, b) => {
            let result = 0;
            if (sortField === 'name') {
                // Sort by lastName, then firstName, nulls last
                const aLast = a.lastName || '';
                const bLast = b.lastName || '';
                if (!a.lastName && b.lastName) return sortDirection === 'asc' ? 1 : -1;
                if (a.lastName && !b.lastName) return sortDirection === 'asc' ? -1 : 1;
                result = aLast.localeCompare(bLast);
                if (result === 0) {
                    const aFirst = a.firstName || '';
                    const bFirst = b.firstName || '';
                    if (!a.firstName && b.firstName) return sortDirection === 'asc' ? 1 : -1;
                    if (a.firstName && !b.firstName) return sortDirection === 'asc' ? -1 : 1;
                    result = aFirst.localeCompare(bFirst);
                }
            } else if (sortField === 'instrument') {
                if (!a.defaultInstrument && !b.defaultInstrument) result = 0;
                else if (!a.defaultInstrument) result = 1;
                else if (!b.defaultInstrument) result = -1;
                else result = a.defaultInstrument.localeCompare(b.defaultInstrument);
            } else if (sortField === 'bands') {
                const aBand = a.bands?.[0]?.name || '';
                const bBand = b.bands?.[0]?.name || '';
                if (!aBand && !bBand) result = 0;
                else if (!aBand) result = 1;
                else if (!bBand) result = -1;
                else result = aBand.localeCompare(bBand);
            } else if (sortField === 'appearances') {
                result = a.appearanceCount - b.appearanceCount;
            }
            return sortDirection === 'asc' ? result : -result;
        })
        : [];

    const handleSort = (field: typeof sortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIndicator = (field: typeof sortField) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    return (
        <PageContainer>
            <div className="page-header">
                <h1 className="page-title">Musicians</h1>
            </div>
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('name')} className="sortable">Name {getSortIndicator('name')}</th>
                            <th onClick={() => handleSort('instrument')} className="sortable">Instrument {getSortIndicator('instrument')}</th>
                            <th onClick={() => handleSort('bands')} className="sortable">Bands {getSortIndicator('bands')}</th>
                            <th onClick={() => handleSort('appearances')} className="sortable">Appearances {getSortIndicator('appearances')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedMusicians.map((m) => (
                            <tr key={m.id}>
                                <td>
                                    <Link href={`/musician/${m.slug}`} className="link">
                                        {m.displayName}
                                    </Link>
                                </td>
                                <td>
                                    {m.defaultInstrument}
                                    {m.defaultInstrument && m.hasVocals ? " and vocals" : m.hasVocals ? "Vocals" : ""}
                                </td>
                                <td>
                                    {m.bands && m.bands.length > 0 ? m.bands.map((band: any, idx: number) => (
                                        <span key={band.id}>
                                            <Link href={`/band/${band.slug}`} className="link">{band.name}</Link>
                                            {idx < m.bands.length - 1 ? ", " : ""}
                                        </span>
                                    )) : ""}
                                </td>
                                <td>{m.appearanceCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </PageContainer>
    );
}
// Server wrapper to fetch data and render client component
export default function MusicianBrowsePage() {
    return <MusicianBrowsePageClient />;
}
