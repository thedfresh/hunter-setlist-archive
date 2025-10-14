import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const rssEntries = await prisma.rssEntry.findMany({
            where: { isPublished: true },
            orderBy: { pubDate: 'desc' },
        });
        return Response.json({ rssEntries });
    } catch (error) {
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
