import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateVenueSlug, resolveSlugCollision } from "@/lib/utils/generateSlug";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const venue = await prisma.venue.findUnique({
            where: { id },
            include: { _count: { select: { events: true } } },
        });
        if (!venue) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(venue);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to fetch venue' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const body = await req.json();
        const { name, city, stateProvince, country, isUncertain = false, publicNotes, privateNotes, context } = body;
        if (!name || typeof name !== "string" || name.trim() === "") {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }
        const slug = body.slug?.trim() || generateVenueSlug(name, city, stateProvince);

        let updated;
        try {
            updated = await prisma.venue.update({
                where: { id },
                data: {
                    name: name.trim(),
                    slug,
                    city: city?.trim() || null,
                    stateProvince: stateProvince?.trim() || null,
                    country: country?.trim() || null,
                    isUncertain: !!isUncertain,
                    publicNotes: publicNotes?.trim() || null,
                    privateNotes: privateNotes?.trim() || null,
                    context: context?.trim() || null,
                },
            });
        } catch (error: any) {
            if (error?.code === 'P2002') {
                const resolvedSlug = await resolveSlugCollision(slug, 'venues', id);
                updated = await prisma.venue.update({
                    where: { id },
                    data: {
                        name: name.trim(),
                        slug: resolvedSlug,
                        city: city?.trim() || null,
                        stateProvince: stateProvince?.trim() || null,
                        country: country?.trim() || null,
                        isUncertain: !!isUncertain,
                        publicNotes: publicNotes?.trim() || null,
                        privateNotes: privateNotes?.trim() || null,
                        context: context?.trim() || null,
                    },
                });
            } else {
                throw error;
            }
        }

        revalidatePath('/admin/venues');
        return NextResponse.json(updated);
    } catch (error: any) {
        console.error('PUT /api/admin/venues/[id] error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to update venue' }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const venue = await prisma.venue.findUnique({
            where: { id },
            include: { _count: { select: { events: true } } },
        });
        if (!venue) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        if (venue._count.events > 0) {
            return NextResponse.json({ error: `Cannot delete - has ${venue._count.events} events` }, { status: 400 });
        }
        await prisma.venue.delete({ where: { id } });
        revalidatePath('/admin/venues');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to delete venue' }, { status: 500 });
    }
}
