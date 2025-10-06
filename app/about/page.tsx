export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8 text-center">About the Robert Hunter Setlist Archive</h1>

      <section className="mb-8">
        <div className="section-header mb-2">Project History</div>
        <p>
          The original Robert Hunter setlist archive was launched in the late 1990s as a fan-driven resource. After a long hiatus, the project was rebuilt from the ground up in 2025 to provide a modern, comprehensive, and interactive experience for fans and researchers alike.
        </p>
      </section>

      <section className="mb-8">
        <div className="section-header mb-2">Data Sources</div>
        <p>
          Our data comes from a variety of sources, including etreedb.org, the Live Music Archive, Lossless Legs, GDSets.com, and direct submissions from contributors. We strive to cross-reference and verify all information where possible.
        </p>
      </section>

      <section className="mb-8">
        <div className="section-header mb-2">Methodology</div>
        <p>
          The archive uses a hybrid approach: automated parsing, large language model (LLM) processing, and careful manual curation. This allows us to process large volumes of data while maintaining accuracy and context.
        </p>
      </section>

      <section className="mb-8">
        <div className="section-header mb-2">Data Quality</div>
        <p>
          This archive is a work in progress. Over 500 shows have been imported so far, with ongoing corrections and updates. We welcome feedback and corrections from the community to improve the accuracy and completeness of the archive.
        </p>
      </section>

      <section className="mb-8">
        <div className="section-header mb-2">How to Contribute</div>
        <p>
          If you have setlists, recordings, corrections, or historical context to share, please get in touch! Community contributions are essential to preserving Hunter's legacy.
        </p>
      </section>

      <section className="mb-8">
        <div className="section-header mb-2">Contact</div>
        <p>
          For contributions, questions, or corrections, email <a href="mailto:dfresh@gmail.com" className="link-internal">dfresh@gmail.com</a>.
        </p>
      </section>

      <section>
        <div className="section-header mb-2">Credits & Acknowledgments</div>
        <p>
          Special thanks to all contributors, tapers, researchers, and fans who have helped build and maintain this archive over the years. Your passion and dedication make this possible.
        </p>
      </section>
    </div>
  );
}
