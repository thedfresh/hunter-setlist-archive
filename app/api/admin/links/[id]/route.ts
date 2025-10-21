import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid link ID' }, { status: 400 });
        }

        const body = await req.json();
        const { url, title, linkTypeId } = body;

        if (!url?.trim()) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const updated = await prisma.link.update({
            where: { id },
            data: {
                url: url.trim(),
                title: title?.trim() || null,
                linkTypeId: linkTypeId === 0 || linkTypeId === null ? null : Number(linkTypeId),
            },
        });

        revalidatePath('/admin/songs');
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating link:', error);
        return NextResponse.json({ error: 'Failed to update link' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return NextResponse.json(
                { error: 'Invalid link ID' },
                { status: 400 }
            );
        }

        // Check if link exists
        const existingLink = await prisma.link.findUnique({
            where: { id }
        });

        if (!existingLink) {
            return NextResponse.json(
                { error: 'Link not found' },
                { status: 404 }
            );
        }

        // Delete the link
        await prisma.link.delete({
            where: { id }
        });

        // Revalidate the songs admin page (songs context)
        revalidatePath('/admin/songs');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting link:', error);
        return NextResponse.json(
            { error: 'Failed to delete link' },
            { status: 500 }
        );
    }
}