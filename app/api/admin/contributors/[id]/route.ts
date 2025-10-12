import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const contributor = await prisma.contributor.findUnique({
            where: { id },
            include: { _count: { select: { eventContributors: true, recordings: true } } },
        });
        if (!contributor) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(contributor);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to fetch contributor' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const { name, email, publicNotes, privateNotes } = await req.json();
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        const updated = await prisma.contributor.update({
            where: { id },
            data: {
                name: name.trim(),
                email: email?.trim() || null,
                publicNotes: publicNotes?.trim() || null,
                privateNotes: privateNotes?.trim() || null,
            },
        });
        revalidatePath('/admin/contributors');
        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to update contributor' }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const contributor = await prisma.contributor.findUnique({
            where: { id },
            include: { _count: { select: { eventContributors: true, recordings: true } } },
        });
        if (!contributor) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const totalContributions = (contributor._count.eventContributors ?? 0) + (contributor._count.recordings ?? 0);
        if (totalContributions > 0) {
            return NextResponse.json({ error: `Cannot delete - has ${totalContributions} contributions` }, { status: 400 });
        }
        await prisma.contributor.delete({ where: { id } });
        revalidatePath('/admin/contributors');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to delete contributor' }, { status: 500 });
    }
}
