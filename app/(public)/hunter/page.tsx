import { getHunterPerformanceStats } from '@/lib/queries/eventBrowseQueries';
import Link from 'next/link';

export default async function HunterHubPage() {
  const stats = await getHunterPerformanceStats();

 

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8 text-center">Robert Hunter</h1>

      <section className="mb-8">
        <div className="section-header mb-2">Biography</div>
        <p>
          Content TK
        </p>
      </section>

    </div>
  );
}
