export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8 text-center">About the Robert Hunter Performance Archive</h1>

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

    </div>
  );
}
