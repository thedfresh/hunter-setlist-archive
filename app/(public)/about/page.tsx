import { PageContainer } from '@/components/ui/PageContainer';

// app/(public)/credits/page.tsx
export const metadata = {
  title: 'About this Site | Hunter Archive',
  description: 'Information about the Robert Hunter Performance Archive project, its history, and how to contribute.'
};

export default function AboutPage() {
  return (
    <PageContainer variant="text">
      <div className="page-header">
        <div className="page-title">About the Archive</div></div>
      <section className="mb-8">
        <div className="section-header mb-2">Project History</div>
        <p>
          The original Robert Hunter setlist archive was launched in the late 1990s as a way to help myself and others identify and catalog
          Hunter's live performances.  Over the years I stopped updating it and it eventually disappeared from the web.  After several aborted
          attempts at reviving it, I have finally relaunched it as a modern, data-driven website.  This new version was built with the assistance of
          Claude and ChatGPT to help parse the old data and build the new site code.
        </p>
      </section>

      <section className="mb-8">
        <div className="section-header mb-2">Data Sources</div>
        <p>
          Performance data comes from a mix of circulating recordings, contributions from fans and researchers, and other online archives such as Lost Live Dead
          and GDSets.com.
        </p>
      </section>

      <section className="mb-8">
        <div className="section-header mb-2">How to Contribute</div>
        <p>
          If you have setlists, recordings, corrections, or historical context to share, please get in touch! Community contributions are essential to preserving
          Hunter's legacy.
        </p>
      </section>

      <section className="mb-8">
        <div className="section-header mb-2">Contact</div>
        <p>
          For contributions, questions, or corrections, email <a href="mailto:dfresh@gmail.com" className="link-internal">dfresh@gmail.com</a>.
        </p>
      </section>

    </PageContainer>
  );
}
