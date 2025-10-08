
import { getBandsBrowse } from '@/lib/queries/bandBrowseQueries';
import Link from 'next/link';

// Helper to color band cards by performer
function getBandCardClass(bandName: string): string {
  const name = bandName.toLowerCase();
  if (name.includes('roadhog')) return 'event-card-roadhog';
  if (name.includes('comfort')) return 'event-card-comfort';
  if (name.includes('dinosaurs')) return 'event-card-dinosaurs';
  return 'event-card-special'; // Ghosts and other bands
}

export default async function BandBrowsePage() {
  const bands = await getBandsBrowse();
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Browse Bands</h1>
      <div className="results-count mb-4">Total bands: <strong>{bands.length}</strong></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bands.map((band: any) => (
          <Link
            key={band.id}
            href={`/band/${band.slug}`}
            className={`event-card ${getBandCardClass(band.name)} block p-6 hover:shadow-md transition-shadow duration-150`}
          >
            <div className="text-lg font-semibold mb-2">{band.name}</div>
            <div className="flex gap-6 text-sm mb-2">
              <span>Shows: <strong>{band._count.events}</strong></span>
              <span>Members: <strong>{band._count.bandMusicians}</strong></span>
            </div>
            {band.publicNotes && (
              <div className="text-xs text-gray-600 mt-2">
                {band.publicNotes.length > 150 ? band.publicNotes.slice(0, 150) + '…' : band.publicNotes}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
