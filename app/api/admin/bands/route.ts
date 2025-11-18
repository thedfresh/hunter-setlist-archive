// app/api/admin/bands/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidateAll } from '@/lib/utils/revalidation';
import { generateSlugFromName, resolveSlugCollision } from '@/lib/utils/generateSlug';

export async function POST(request: Request) {
    try {
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
            band = await prisma.band.create({
                data: { name, slug, publicNotes, privateNotes }
            });
        } catch (err: any) {
            if (err?.code === 'P2002') {
                const resolvedSlug = await resolveSlugCollision(slug, 'bands');
                band = await prisma.band.create({
                    data: { name, slug: resolvedSlug, publicNotes, privateNotes }
                });
            } else {
                throw err;
            }
        }

        revalidateAll();
        return NextResponse.json(band, { status: 201 });
    } catch (error: any) {
        console.error('POST /api/admin/bands error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to create band' }, { status: 500 });
    }
}