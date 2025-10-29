import { redirect } from 'next/navigation';
import { getBrowsableEventsWhere } from '@/lib/utils/queryFilters';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    const idOrSlug = params.slug;

    // Try to parse as ID first
    const id = parseInt(idOrSlug, 10);
    if (!isNaN(id)) {
        const event = await prisma.event.findFirst({
            where: { id, ...getBrowsableEventsWhere() },
            select: { slug: true }
        });
        if (event) {
            redirect(`/event/${event.slug}`);
        }
        // If not found or not public, return 404
        return new Response('Event not found', { status: 404 });
    }

    // Otherwise assume it's already a slug
    // Check if slug is public
    const event = await prisma.event.findFirst({
        where: { slug: idOrSlug, ...getBrowsableEventsWhere() },
        select: { slug: true }
    });
    if (event) {
        redirect(`/event/${event.slug}`);
    }
    return new Response('Event not found', { status: 404 });
}