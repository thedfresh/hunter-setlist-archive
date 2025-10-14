import { PageContainer } from '@/components/ui/PageContainer';
import ExternalLink from '@/components/ui/ExternalLink';

export default function CreditsPage() {
    return (
        <PageContainer variant="text">
            <div className="page-header">
                <div className="page-title">Credits &amp; Acknowledgments</div></div>
            <section className="mb-8">

                <p className="mb-4">This site has always depended on contributions from Robert Hunter fans and Grateful Dead researchers for its content—the extent of my contribution is an obsession with documenting the exact number of Dire Wolfs and Peggy-Os in Hunter's medleys.</p>

                <h2 className="text-xl font-semibold mt-8 mb-4">Major Research Contributors</h2>

                <p className="mb-4"><strong>Corry Arnold's</strong> research on Hunter's early career at his <ExternalLink href="http://lostlivedead.blogspot.com/">Lost Live Dead</ExternalLink> and <ExternalLink href="https://hooterollin.blogspot.com/">Hooterollin' Around</ExternalLink> blogs has provided virtually all the non-recorded information about the Roadhog and Comfort eras. His research on the Grateful Dead and music history in general is just as interesting and valuable—if you enjoy this kind of niche music content, you've probably already read his site. If not, don't you dare miss it.</p>

                <p className="mb-4"><strong>Jesse Jarnow</strong> has also done incredible research into Hunter's early years, work that he is generously sharing with this site and will continue to make its way into the archive for years to come. He also wrote the wonderful liner notes to Rhino's recent <ExternalLink href="https://www.rhino.com/article/robert-hunters-tales-of-the-great-rum-runners-deluxe-edition-detailed">Tales of the Great Rum Runners</ExternalLink> and <ExternalLink href="https://media.rhino.com/press-release/tiger-rose-50th-anniversary">Tiger Rose</ExternalLink> anniversary reissues. He was also an early contributor to the site and continues to feed me a level of show notation detail that is invaluable.</p>

                <p className="mb-4"><strong>Brian Miksis</strong> co-produced the <ExternalLink href="https://www.garciafamilyprovisions.com/dept/before-the-dead">"Before the Dead"</ExternalLink> box set featuring early Jerry Garcia bluegrass ensembles, several of which feature a young Robert Hunter. He is also currently transferring and remastering Hunter shows that have yet to circulate digitally and was a huge source of inspiration to get this site back online. <strong>Dave Lennox</strong> has been a key part of this project, meticulously documenting setlists and identifying unlabeled/mislabeled material—information that is improving this site daily.</p>

                <p className="mb-4"><strong>Bill Gallagher</strong> contributed an enormous amount of the performance data on this site by meticulously combing through <em>Bay Area Music</em> (BAM) magazine and sharing all that research with the archive.</p>

                <p className="mb-4"><strong>Alex Allan's</strong> lyrics site <ExternalLink href="https://whitegum.com/intro.htm">WhiteGum</ExternalLink> contains a wealth of information about Hunter's songwriting process and has been invaluable in deciphering the lyrical and musical fragments that define a good Hunter setlist.</p>

                <h2 className="text-xl font-semibold mt-8 mb-4">Archival & Technical Resources</h2>

                <p className="mb-4">Special shout-out to <ExternalLink href="https://gdsets.com/">GDSets.com</ExternalLink> for keeping Hunter setlists online for all the years when this site was dormant. GDSets remains the only source for an enormous amount of Hunter concert posters, ticket stubs, and other ephemera—do check it out.</p>

                <p className="mb-4">The crew at <ExternalLink href="https://jerrybase.com/">JerryBase</ExternalLink> have built a peerless example of what a good online performance archive should look like. Pretty much any nice feature here was modeled on something they already implemented.</p>

                <p className="mb-4">The <ExternalLink href="https://archive.org/details/RobertHunter">Internet Archive's Live Music Archive</ExternalLink> hosts the vast majority of circulating Hunter recordings and makes them freely accessible to researchers and fans worldwide. This site wouldn't exist without their commitment to preserving live music culture.</p>

                <h2 className="text-xl font-semibold mt-8 mb-4">Early & Ongoing Contributors</h2>

                <p className="mb-4">Other early and ongoing contributors to this site include <strong>Michael Parrish</strong>, <strong>Nick Alexander</strong>, <strong>John Hawridge</strong>, <strong>Matt Schofield</strong>, <strong>Aaron Gangross</strong>, <strong>Karen Chetty</strong>, <strong>Marc Young</strong>, <strong>Glen Kernan</strong>, <strong>Gabriel Montemurro</strong>, <strong>Chris Carty</strong>, <strong>Ed Luskey</strong>, <strong>Jeff Bednar</strong>, <strong>Neill Thompson</strong>, <strong>Tristan Moore</strong>, <strong>DeadBase</strong>, <strong>Mat Rice</strong>, <strong>Craig O'Leary</strong>, <strong>Joel Peterson</strong>, <strong>Thomas Donaldson</strong>, <strong>Brian Griffin</strong>, <strong>Tzuriel Kastel</strong>, <strong>Ihor Slabicky</strong>, <strong>Paul Knudsvig</strong>, <strong>Dave Tomanek</strong>, <strong>Randy Switts</strong>, <strong>rec.music.gdead</strong>, the <strong>Knights of Goodbye</strong>, <strong>Lee Hartle</strong>, the late <strong>Robert Hunter Tour Site</strong>, <strong>Scott Mitchell</strong>, <strong>Al Sodoma</strong>, and <strong>Ryan Shriver</strong>. Apologies for any misspelled names or omitted contributors—to anyone still out there, please get in touch and let me know you've seen the new site!</p>

                <h2 className="text-xl font-semibold mt-8 mb-4">In Memoriam</h2>

                <p className="mb-4">Finally, a special thank you to a couple of core contributors who are no longer with us—<ExternalLink href="https://www.instagram.com/p/C0mnP4TuUCm/?hl=en">"Lone Star Dead's" Eric Schwartz</ExternalLink>, and OG Hunter fan <strong>Richard Petlock</strong>, who was responsible for some of the earliest and best Hunter shows to circulate.</p>

                <hr className="my-8 border-t border-gray-300" />

                <p className="mb-4">And of course, all of this exists because of the peerless talents and generous spirit of <strong>Robert Hunter</strong> himself.</p>
            </section>
        </PageContainer>
    );
}
