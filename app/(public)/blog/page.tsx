import { PageContainer } from '@/components/ui/PageContainer';

export const metadata = {
    title: 'Blog | StillUnsung.com',
    description: 'Updates from the StillUnsung.com admin',
};

export default function BlogPage() {
    return (
        <PageContainer variant="text">
            <div className="page-header">
                <div className="page-title">Blog</div></div>
            <section className="mb-8">
                <p className="mb-4">
                    Coming soon - blog updates from the StillUnsung.com admin, including new features, updates to the archive, and more.  This will power the RSS feed, so if you're subscribed there, stay tuned!
                </p>
            </section>

        </PageContainer>
    );
}
