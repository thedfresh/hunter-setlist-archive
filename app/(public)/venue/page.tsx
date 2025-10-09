
import { getVenuesBrowse } from '@/lib/queries/venueBrowseQueries';
import { PageContainer } from '@/components/ui/PageContainer';

import VenueTableClient from './VenueTableClient';

export default async function VenueBrowsePage() {
  const venues = await getVenuesBrowse();
  return (
    <PageContainer>
      <div className="page-header">
        <div className="page-title">Venues</div>
      </div>
      <VenueTableClient venues={venues} />
    </PageContainer>
  );
}
