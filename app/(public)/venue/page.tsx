
import { getVenuesBrowse } from '@/lib/queries/venueBrowseQueries';

import VenueTableClient from './VenueTableClient';

export default async function VenueBrowsePage() {
  const venues = await getVenuesBrowse();
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Browse Venues</h1>
      {/* VenueTableClient now shows filtered count and search UI */}
      <VenueTableClient venues={venues} />
    </div>
  );
}
