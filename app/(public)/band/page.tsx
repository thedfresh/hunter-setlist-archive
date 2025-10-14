import { getBandsBrowse } from '@/lib/queries/bandBrowseQueries';
import { PageContainer } from '@/components/ui/PageContainer';
import Link from 'next/link';
import { getPerformerCardClass } from '@/lib/utils/performerStyles';

// Helper to adapt band name for card class
function getBandCardClassFromName(bandName: string): string {
  return getPerformerCardClass({ primaryBand: { name: bandName, isHunterBand: true } });
}

export const metadata = {
  title: 'Bands | Hunter Archive',
  description: "Robert Hunter's bands and guest appearances - Comfort, Roadhog, Dinosaurs, and more",
};

export default async function BandBrowsePage() {
  const bands = await getBandsBrowse();
  const hunterBands = bands.filter((b: any) => b.isHunterBand)
    .sort((a: any, b: any) => b._count.events - a._count.events);
  const guestBands = bands.filter((b: any) => !b.isHunterBand)
    .sort((a: any, b: any) => b._count.events - a._count.events);
  return (
    <PageContainer>
      <div className="page-header">
        <div className="page-title">Bands</div>
      </div>

      <h2 className="text-xl font-bold mt-4 mb-2">Hunter's Bands</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {hunterBands.map((band: any) => (
          <Link
            key={band.id}
            href={`/band/${band.slug}`}
            className={`event-card ${getBandCardClassFromName(band.name)} block p-6 hover:shadow-md transition-shadow duration-150`}
          >
            <div className="flex flex-row gap-6">
              <div className="basis-1/3 min-w-[120px]">
                <div className="text-lg font-semibold mb-2">{band.name}</div>
                {band.displayName && <div className="text-sm text-gray-500 mb-1">{band.displayName}</div>}
                <div className="flex gap-6 text-sm mb-2">
                  <span>Shows: <strong>{band._count.events}</strong></span>
                </div>
              </div>
              <div className="basis-2/3 border-l pl-6">
                {band.bandMusicians && band.bandMusicians.length > 0 ? (
                  <ul className="text-sm text-gray-700">
                    {band.bandMusicians.map((bm: any) => (
                      <li key={bm.id} className="mb-1">
                        {bm.musician?.name}
                        {bm.musician?.defaultInstruments && bm.musician.defaultInstruments.length > 0 && (
                          <span className="text-xs text-gray-500"> — {bm.musician.defaultInstruments.map((di: any) => di.instrument.displayName).join(', ')}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : ('')}
              </div>
            </div>
          </Link>
        ))}
      </div>
      <h2 className="text-xl font-bold mt-4 mb-2">Hunter Guest Appearances</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guestBands.map((band: any) => (
          <Link
            key={band.id}
            href={`/band/${band.slug}`}
            className={`event-card event-card-guest block p-6 hover:shadow-md transition-shadow duration-150`}
          >
            <div className="flex flex-row gap-6">
              <div className="basis-1/3 min-w-[120px]">
                <div className="text-lg font-semibold mb-2">{band.name}</div>
                {band.displayName && <div className="text-sm text-gray-500 mb-1">{band.displayName}</div>}
                <div className="flex gap-6 text-sm mb-2">
                  <span>Shows: <strong>{band._count.events}</strong></span>
                </div>
                {band.publicNotes && (
                  <div className="text-xs text-gray-600 mt-2">
                    {band.publicNotes.length > 150 ? band.publicNotes.slice(0, 150) + '\u2026' : band.publicNotes}
                  </div>
                )}
              </div>
              <div className="basis-2/3 border-l pl-6">
                {band.bandMusicians && band.bandMusicians.length > 0 ? (
                  <ul className="text-sm text-gray-700">
                    {band.bandMusicians.map((bm: any) => (
                      <li key={bm.id} className="mb-1">
                        {bm.musician?.name}
                        {bm.musician?.defaultInstruments && bm.musician.defaultInstruments.length > 0 && (
                          <span className="text-xs text-gray-500"> — {bm.musician.defaultInstruments.map((di: any) => di.instrument.displayName).join(', ')}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : ('')}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </PageContainer>


  );
}
