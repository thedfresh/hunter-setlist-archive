import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function GET(_req: Request, { params }: { params: { id: string; setId: string; musicianId: string } }) {
    try {
        const setId = Number(params.setId);
        const musicianId = Number(params.musicianId);
        const setMusician = await prisma.setMusician.findFirst({
            where: { setId, musicianId },
            include: {
                musician: true,
                instrument: true,
            },
        });
        if (!setMusician) {
            return NextResponse.json({ error: "Set musician not found" }, { status: 404 });
        }
        return NextResponse.json(setMusician);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string; setId: string; musicianId: string } }) {
    try {
        const setId = Number(params.setId);
        const musicianId = Number(params.musicianId);
        const body = await req.json();
        const { instrumentId, publicNotes, privateNotes, includesVocals } = body;
        const setMusician = await prisma.setMusician.findFirst({
            where: { setId, musicianId },
        });
        if (!setMusician) {
            return NextResponse.json({ error: "Set musician not found" }, { status: 404 });
        }
        const updated = await prisma.setMusician.update({
            where: { id: setMusician.id },
            data: {
                instrumentId,
                publicNotes,
                privateNotes,
                includesVocals,
            },
        });
        revalidatePath('/admin/events');
        return NextResponse.json(updated);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string; setId: string; musicianId: string } }) {
    try {
        const setId = Number(params.setId);
        const musicianId = Number(params.musicianId);
        const setMusician = await prisma.setMusician.findFirst({
            where: { setId, musicianId },
        });
        if (!setMusician) {
            return NextResponse.json({ error: "Set musician not found" }, { status: 404 });
        }
        await prisma.setMusician.delete({ where: { id: setMusician.id } });
        revalidatePath('/admin/events');
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
