
import { getBandsBrowse } from '@/lib/queries/bandBrowseQueries';
import { PageContainer } from '@/components/ui/PageContainer';
import Link from 'next/link';

// Helper to color band cards by performer
function getBandCardClass(bandName: string): string {
  const name = bandName.toLowerCase();
  if (name === 'robert hunter') return 'event-card-solo';
  if (name.includes('roadhog')) return 'event-card-roadhog';
  if (name.includes('comfort')) return 'event-card-comfort';
  if (name.includes('dinosaurs')) return 'event-card-dinosaurs';
  return 'event-card-special'; // Ghosts and other bands
}

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
            className={`event-card ${getBandCardClass(band.name)} block p-6 hover:shadow-md transition-shadow duration-150`}
          >
            <div className="text-lg font-semibold mb-2">{band.name}</div>
            {band.displayName && <div className="text-sm text-gray-500 mb-1">{band.displayName}</div>}
            <div className="flex gap-6 text-sm mb-2">
              <span>Shows: <strong>{band._count.events}</strong></span>
              {band._count.bandMusicians > 0 && (
                <span>Members: <strong>{band._count.bandMusicians}</strong></span>
              )}
            </div>
            {band.publicNotes && (
              <div className="text-xs text-gray-600 mt-2">
                {band.publicNotes.length > 150 ? band.publicNotes.slice(0, 150) + '\u2026' : band.publicNotes}
              </div>
            )}
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
            <div className="text-lg font-semibold mb-2">{band.name}</div>
            {band.displayName && <div className="text-sm text-gray-500 mb-1">{band.displayName}</div>}
            <div className="flex gap-6 text-sm mb-2">
              <span>Shows: <strong>{band._count.events}</strong></span>
              <span>Members: <strong>{band._count.bandMusicians}</strong></span>
            </div>
            {band.publicNotes && (
              <div className="text-xs text-gray-600 mt-2">
                {band.publicNotes.length > 150 ? band.publicNotes.slice(0, 150) + '\u2026' : band.publicNotes}
              </div>
            )}
          </Link>
        ))}
      </div>
    </PageContainer>


  );
}
