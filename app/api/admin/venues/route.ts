import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateVenueSlug, resolveSlugCollision } from "@/lib/utils/generateSlug";


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, city, stateProvince, country, isUncertain = false, publicNotes, privateNotes, context } = body;
        if (!name || typeof name !== "string" || name.trim() === "") {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }
        const slug = body.slug?.trim() || generateVenueSlug(name, city, stateProvince);

        let venue;
        try {
            venue = await prisma.venue.create({
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
                const resolvedSlug = await resolveSlugCollision(slug, 'venues');
                venue = await prisma.venue.create({
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
        return NextResponse.json(venue, { status: 201 });
    } catch (error: any) {
        console.error('POST /api/admin/venues error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to create venue' }, { status: 500 });
    }
}