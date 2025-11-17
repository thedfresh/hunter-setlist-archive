import { PageContainer } from '@/components/ui/PageContainer';

export const metadata = {
    title: 'Deep Dives | StillUnsung.com',
    description: 'A guide to Robert Hunter performances - high quality shows, interesting setlists, unique performances and more.',
};

export default function DeepDivesPage() {
    return (
        <PageContainer variant="text">
            <div className="page-header">
                <div className="page-title">Deep Dives</div></div>
            <section className="mb-8">
                <p className="mb-4">
                    Coming soon - a guide to Hunter's most interesting performances, including high quality shows, unique setlists, and more.
                </p>
            </section>

        </PageContainer>
    );
}
