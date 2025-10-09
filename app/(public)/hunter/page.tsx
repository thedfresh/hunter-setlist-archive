import { getHunterPerformanceStats } from '@/lib/queries/eventBrowseQueries';
import { PageContainer } from '@/components/ui/PageContainer';

export default async function HunterHubPage() {
  const stats = await getHunterPerformanceStats();
  return (
    <PageContainer variant="text">
      <div className="page-header">
        <div className="page-title">About Robert Hunter</div>
      </div>
      <section className="mb-8">
        <p>
          Content TK
        </p>
      </section>

    </PageContainer>
  );
}
