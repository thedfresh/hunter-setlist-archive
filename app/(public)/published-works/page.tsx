import { PageContainer } from '@/components/ui/PageContainer';

export const metadata = {
    title: 'Published Works | StillUnsung.com',
    description: 'A guide to Robert Hunter\'s albums, books and other published media.',
};

export default function PublishedWorksPage() {
    return (
        <PageContainer variant="text">
            <div className="page-header">
                <div className="page-title">Published Works</div></div>
            <section className="mb-8">
                <div className="section-header mb-2">Coming soon!</div>
                <p>
                    A guide to Hunter's albums (released and unreleased), published books, poetry translations and other published media.
                </p>
            </section>

        </PageContainer>
    );
}
