import { getHunterPerformanceStats } from '@/lib/queries/eventBrowseQueries';
import Link from 'next/link';

export default async function HunterHubPage() {
  const stats = await getHunterPerformanceStats();

  function formatDate(d: any) {
    if (!d) return '';
    if (d.displayDate) return d.displayDate;
    if (d.year && d.month && d.day) {
      const mm = String(d.month).padStart(2, '0');
      const dd = String(d.day).padStart(2, '0');
      return `${d.year}-${mm}-${dd}`;
    }
    if (d.year) return String(d.year);
    return '';
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8 text-center">Robert Hunter</h1>

      <section className="mb-8">
        <div className="section-header mb-2">Biography</div>
        <p>
          Robert Hunter (1941-2019) was an American lyricist, singer-songwriter, and poet, best known as the primary lyricist for the Grateful Dead. [Placeholder: Full biography coming soon.]
        </p>
      </section>

      <section className="mb-8">
        <div className="section-header mb-2">Career Timeline Highlights</div>
        <ul className="list-disc pl-6 text-sm">
          <li>1960s: Folk roots and early songwriting</li>
          <li>1967+: Grateful Dead lyricist and collaborator</li>
          <li>1970s-80s: Solo career, major albums, and tours</li>
          <li>1980s-90s: Roadhog, Comfort, Dinosaurs, and other bands</li>
          <li>2000s: Later acoustic work and select performances</li>
        </ul>
      </section>

      <section className="mb-8">
        <div className="section-header mb-2">Discography Overview</div>
        <ul className="list-disc pl-6 text-sm">
          <li>Tales of the Great Rum Runners (1974)</li>
          <li>Tiger Rose (1975)</li>
          <li>Jack O'Roses (1980)</li>
          <li>Promontory Rider (2007)</li>
          <li>...and more</li>
        </ul>
      </section>

      <section className="mb-8">
        <div className="section-header mb-2">Performance History</div>
        <div className="mb-2 text-sm">
          <strong>Total Shows:</strong> {stats.totalShows}<br />
          <strong>Date Range:</strong> {formatDate(stats.firstShow)} – {formatDate(stats.lastShow)}
        </div>
        <div className="mb-2 text-sm">
          <strong>Shows by Performer:</strong>
          <ul className="list-disc pl-6">
            {stats.breakdown.map((b: any) => (
              <li key={b.name}>{b.name}: {b.count}</li>
            ))}
          </ul>
        </div>
        <div className="mt-2 flex gap-4">
          <Link href="/event" className="link-internal font-semibold">Browse Shows</Link>
          <Link href="/song" className="link-internal font-semibold">Browse Songs</Link>
        </div>
      </section>

      <section className="mb-8">
        <div className="section-header mb-2">External Resources</div>
        <ul className="list-disc pl-6 text-sm">
          <li><a href="https://boxofrain.net/" target="_blank" rel="noopener" className="link-internal">Box of Rain (lyrics)</a></li>
          <li><a href="https://archive.org/details/RobertHunter" target="_blank" rel="noopener" className="link-internal">Archive.org Hunter Collections</a></li>
          <li><a href="https://www.discogs.com/artist/253857-Robert-Hunter" target="_blank" rel="noopener" className="link-internal">Discogs Discography</a></li>
          <li><a href="https://gdsets.com/hunter" target="_blank" rel="noopener" className="link-internal">GDSets.com Hunter</a></li>
        </ul>
      </section>
    </div>
  );
}
