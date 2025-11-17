import { PageContainer } from '@/components/ui/PageContainer';
import Link from 'next/link';

export const metadata = {
    title: 'For Researchers | StillUnsung.com',
    description: 'Coming soon - tools for researchers interested in Hunter\'s music and lyrics.',
};

export default function ResearchersPage() {
    return (
        <PageContainer variant="text">
            <div className="page-header">
                <div className="page-title">For Researchers</div></div>
            <section className="mb-8">
                <p className="mb-4">
                    Coming soon (but probably not <i>that</i> soon) - tools for researchers interested in Hunter's music and lyrics.  This site intends to offer more than just setlists - it's a growing collection of lyrical variations, Hunter's show banter and stories, as well as Hunter's writings online in the '90s and '00s.  The plan is to make non-copyright data freely available, as well as offerings tools to explore it.
                </p>
                <p>If you're interested in helping out, please <Link href="mailto:dfresh@gmail.com" className="link-internal">reach out!</Link></p>
            </section>


        </PageContainer>
    );
}
