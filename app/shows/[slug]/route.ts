import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    const idOrSlug = params.slug;

    // Try to parse as ID first
    const id = parseInt(idOrSlug, 10);
    if (!isNaN(id)) {
        const event = await prisma.event.findUnique({
            where: { id },
            select: { slug: true }
        });
        if (event) {
            redirect(`/event/${event.slug}`);
        }
    }

    // Otherwise assume it's already a slug
    redirect(`/event/${idOrSlug}`);
}