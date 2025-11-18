import ExternalLink from '@/components/ui/ExternalLink';
import { PageContainer } from '@/components/ui/PageContainer';

export const metadata = {
    title: 'Getting Started | StillUnsung.com',
    description: 'An introduction to Robert Hunter\s music career, including his early life, major milestones, and key collaborations.',
};

export default function GettingStartedPage() {
    return (
        <PageContainer variant="text">
            <div className="page-header">
                <div className="page-title">Getting Started</div></div>
            <section className="mb-8">
                <div className="section-header mb-2">Introduction to Robert Hunter</div>
                <p className="mb-4">
                    Coming soon - an overview of Hunter's career as a musician, published author and lyricist.
                </p>
                <p className="mb-4">
                    Hunter's early career with the Liberty Hill Aristocrats, who later became Roadhog, is well documented on Corry Arnold's <ExternalLink href="https://lostlivedead.blogspot.com/2010/11/robert-hunter-and-roadhog-performance.html">Lost Live Dead Roadhog</ExternalLink> blog entry.  Additional material from this era, including fantastic interviews with some of the participants, can be found on the <ExternalLink href="https://www.dead.net/deadcast/bonus-tales-great-rum-runners-50">Rum Runners 50</ExternalLink> episode of the Deadcast.  The Deadcast also covered <ExternalLink href="https://www.dead.net/deadcast/bonus-tiger-rose-50">the recording of Tiger Rose</ExternalLink> - both episodes are essential listnening for those curious about Hunter's solo work.
                </p>
                <p className="mb-4">
                    Hunter's subsequent career with Comfort is documented in a <ExternalLink href="https://lostlivedead.blogspot.com/2009/07/robert-hunter-and-comfort-performing.html">subsequent LLD post</ExternalLink>.  And the Dinosaurs era is covered on LLD's sister blog, <ExternalLink href="https://hooterollin.blogspot.com/2016/09/dinosaurs-with-robert-hunter-1982-84.html">Hooteroolin' Around</ExternalLink>.
                </p>
                <p className="mb-4">
                    Finally, the Good Ol' Grateful Deadcast <ExternalLink href="https://www.dead.net/deadcast/bonus-keys-rain-celebrating-robert-hunters-80th">episode on Hunter</ExternalLink> offers a deep dive on Hunter's poetry and other writings beyong Grateful Dead lyrics.
                </p>
                <p>
                    More to come!
                </p>
            </section>
        </PageContainer >
    );
}
