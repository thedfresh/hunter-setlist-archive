import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const entry = await prisma.rssEntry.findUnique({
            where: { id: parseInt(params.id, 10) },
        });
        if (!entry) {
            return Response.json({ error: 'Not found' }, { status: 404 });
        }
        return Response.json(entry);
    } catch (error) {
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const { title, description, link, pubDate, isPublished } = body;
        if (!title || !description) {
            return Response.json({ error: 'Title and description are required.' }, { status: 400 });
        }
        const entry = await prisma.rssEntry.update({
            where: { id: parseInt(params.id, 10) },
            data: {
                title,
                description,
                link: link || null,
                pubDate: pubDate ? new Date(pubDate) : new Date(),
                isPublished: isPublished ?? false,
            },
        });
        revalidatePath('/admin/rss-entries');
        return Response.json(entry);
    } catch (error) {
        if (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            (error as any).code === 'P2025'
        ) {
            return Response.json({ error: 'Not found' }, { status: 404 });
        }
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const entry = await prisma.rssEntry.delete({
            where: { id: parseInt(params.id, 10) },
        });
        revalidatePath('/admin/rss-entries');
        return Response.json(entry);
    } catch (error) {
        if (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            (error as any).code === 'P2025'
        ) {
            return Response.json({ error: 'Not found' }, { status: 404 });
        }
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
