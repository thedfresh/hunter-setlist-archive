// app/api/admin/bands/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { generateSlugFromName } from '@/lib/utils/generateSlug';

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

        try {
            const band = await prisma.band.create({
                data: { name, slug, publicNotes, privateNotes }
            });
            revalidatePath('/admin/bands');
            return NextResponse.json(band, { status: 201 });
        } catch (err: any) {
            if (err?.code === 'P2002') {
                return NextResponse.json({ error: 'Slug must be unique' }, { status: 400 });
            }
            throw err;
        }
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to create band' }, { status: 500 });
    }
}