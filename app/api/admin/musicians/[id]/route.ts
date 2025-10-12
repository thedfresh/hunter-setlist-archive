import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const musician = await prisma.musician.findUnique({
            where: { id },
            include: { _count: { select: { eventMusicians: true, performanceMusicians: true, bandMusicians: true } } },
        });
        if (!musician) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(musician);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to fetch musician' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const { name, isUncertain = false, publicNotes, privateNotes } = await req.json();
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        const updated = await prisma.musician.update({
            where: { id },
            data: {
                name: name.trim(),
                isUncertain: typeof isUncertain === 'boolean' ? isUncertain : false,
                publicNotes: publicNotes?.trim() || null,
                privateNotes: privateNotes?.trim() || null,
            },
        });
        revalidatePath('/admin/musicians');
        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to update musician' }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const musician = await prisma.musician.findUnique({
            where: { id },
            include: { _count: { select: { eventMusicians: true, performanceMusicians: true, bandMusicians: true } } },
        });
        if (!musician) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const totalAppearances = (musician._count.eventMusicians ?? 0) + (musician._count.performanceMusicians ?? 0) + (musician._count.bandMusicians ?? 0);
        if (totalAppearances > 0) {
            return NextResponse.json({ error: `Cannot delete - has ${totalAppearances} appearances` }, { status: 400 });
        }
        await prisma.musician.delete({ where: { id } });
        revalidatePath('/admin/musicians');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to delete musician' }, { status: 500 });
    }
}
