// app/api/admin/bands/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { generateSlugFromName, resolveSlugCollision } from '@/lib/utils/generateSlug';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const band = await prisma.band.findUnique({
            where: { id },
            include: { _count: { select: { events: true } } },
        });
        if (!band) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(band);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to fetch band' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

        const body = await request.json();
        const name = (body.name || '').trim();
        const slug = body.slug?.trim() || generateSlugFromName(name);
        const publicNotes = body.publicNotes?.trim() || null;
        const privateNotes = body.privateNotes?.trim() || null;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        let band;
        try {
            band = await prisma.band.update({
                where: { id },
                data: { name, slug, publicNotes, privateNotes }
            });
        } catch (err: any) {
            if (err?.code === 'P2002') {
                const resolvedSlug = await resolveSlugCollision(slug, 'bands', id);
                band = await prisma.band.update({
                    where: { id },
                    data: { name, slug: resolvedSlug, publicNotes, privateNotes }
                });
            } else {
                throw err;
            }
        }

        revalidatePath('/admin/bands');
        return NextResponse.json(band);
    } catch (error: any) {
        console.error('PUT /api/admin/bands/[id] error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to update band' }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const band = await prisma.band.findUnique({
            where: { id },
            include: { _count: { select: { events: true } } },
        });
        if (!band) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        if (band._count.events > 0) {
            return NextResponse.json({ error: `Cannot delete - has ${band._count.events} shows in archive` }, { status: 400 });
        }
        await prisma.band.delete({ where: { id } });
        revalidatePath('/admin/bands');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to delete band' }, { status: 500 });
    }
}