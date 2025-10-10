import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PageContainer } from '@/components/ui/PageContainer';

export default function Loading() {
    return (
        <PageContainer variant="text">
            <LoadingSpinner />
        </PageContainer>
    );
}