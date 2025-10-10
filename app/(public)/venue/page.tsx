
import { getVenuesBrowse } from '@/lib/queries/venueBrowseQueries';
import { PageContainer } from '@/components/ui/PageContainer';

import VenueTableClient from './VenueTableClient';

export default async function VenueBrowsePage() {
  const venues = await getVenuesBrowse();
  return (
    <PageContainer>
      <VenueTableClient venues={venues} />
    </PageContainer>
  );
}
