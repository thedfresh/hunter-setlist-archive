import React from 'react';

export default function EventDetailPage() {
  return (
    <main className="event-card event-card-solo p-6">
      <header className="card-title mb-4">
        <span>2002-08-07</span> - <span>Solo Hunter</span> <span className="badge badge-verified">Verified</span>
      </header>
      <div className="card-subtitle mb-6">Gallatin Gateway Inn, Bozeman, MT</div>
  <div className="notes-section mb-6">
        <div className="notes-title font-semibold mb-1">Show Notes:</div>
        <div className="notes-content">With Larry Klein on bass for Set 2. Opening for New Riders of the Purple Sage.</div>
      </div>

  <div className="rounded-lg p-2.5 border border-gray-100 bg-white/40">
        <section className="set-section flex gap-3 mt-0">
          <div className="set-label min-w-[80px] text-right">Set 1</div>
          <div className="setlist flex-1">Box Of Rain, Cruel White Water, Cumberland Blues[1], Lazy River Road, Brown Eyed Women[1], The Wind Blows High, Rum Runners, Stella Blue, Candyman, Scarlet Begonias, Doin' That Rag, Promontory Rider</div>
        </section>

        <section className="set-section flex gap-3 mt-3">
          <div className="set-label min-w-[80px] text-right">Set 2</div>
          <div className="setlist flex-1">Uncle John's Band &gt; Brokedown Palace &gt; Days Between, Lady With A Fan &gt; Terrapin Station, Dire Wolf &gt; Peggy-O &gt; Dire Wolf &gt; Peggy-O, Stagger Lee, Beedle Um Bum &gt; Crazy Words Crazy Tune &gt; Beedle Um Bum &gt; We Shall Not Be Moved &gt; Tiger Rose &gt; Louis Collins, Easy Wind, Reuben And Cerise, Wharf Rat, Liberty</div>
        </section>

        <section className="set-section flex gap-3 mt-3">
          <div className="set-label min-w-[80px] text-right">Encore</div>
          <div className="setlist flex-1">Ripple</div>
        </section>
      </div>

      <div className="notes-section pt-5 border-t mt-8">
        <div className="notes-title font-semibold mb-1">Performance Notes:</div>
        <div className="notes-content">[1] First verse only</div>
      </div>

      {/* Stage Talk Section */}
  <div className="notes-section mt-5">
        <div className="notes-title font-semibold mb-1">Stage Talk:</div>
        <div>
          <span className="banter-label font-semibold text-sm">Before Uncle John's Band:</span>{' '}
          <span className="text-sm">Hunter mentions this was one of the first songs he wrote with Jerry Garcia.</span>
        </div>
        <div className="mt-2">
          <span className="banter-label font-semibold text-sm">After Terrapin Station:</span>{' '}
          <span className="text-sm">A brief story about the song's origins.</span>
        </div>
      </div>

      {/* Recordings Section */}
      <div className="recording-section mt-5">
        <div className="notes-title font-semibold mb-1">Recordings:</div>
        <div className="recording-item mb-1">
          SBD • Soundboard recording by Dan Healy <span className="badge badge-sbd ml-2">SBD</span>
        </div>
        <div className="recording-item">
          AUD • Audience recording, Sony microphones <span className="badge badge-aud ml-2">AUD</span>
        </div>
      </div>
    </main>
  );
}
