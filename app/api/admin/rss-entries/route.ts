import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function GET() {
    try {
        const rssEntries = await prisma.rssEntry.findMany({
            orderBy: { pubDate: 'desc' }
        });
        return Response.json({ rssEntries });
    } catch (error) {
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, link, pubDate, isPublished } = body;
        if (!title || !description) {
            return Response.json({ error: 'Title and description are required.' }, { status: 400 });
        }
        const entry = await prisma.rssEntry.create({
            data: {
                title,
                description,
                link: link || null,
                pubDate: pubDate ? new Date(pubDate) : new Date(),
                isPublished: isPublished ?? false,
            },
        });
        revalidatePath('/admin/rss-entries');
        revalidatePath('/rss.xml')
        return Response.json(entry, { status: 201 });
    } catch (error) {
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
