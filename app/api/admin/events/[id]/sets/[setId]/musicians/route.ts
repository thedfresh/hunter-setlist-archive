import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function GET(_req: Request, { params }: { params: { id: string; setId: string } }) {
    try {
        const setId = Number(params.setId);
        const setMusicians = await prisma.setMusician.findMany({
            where: { setId },
            include: {
                musician: { select: { id: true, name: true } },
                instrument: { select: { id: true, displayName: true } },
            },
            orderBy: { musician: { name: "asc" } },
        });
        return NextResponse.json({ setMusicians });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { id: string; setId: string } }) {
    try {
        const setId = Number(params.setId);
        const body = await req.json();
        const { musicianId, instrumentId, publicNotes, privateNotes } = body;
        if (!musicianId) {
            return NextResponse.json({ error: "musicianId is required" }, { status: 400 });
        }
        const exists = await prisma.setMusician.findFirst({
            where: { setId, musicianId },
        });
        if (exists) {
            return NextResponse.json({ error: "This musician is already added to this set" }, { status: 400 });
        }
        const setMusician = await prisma.setMusician.create({
            data: {
                setId,
                musicianId,
                instrumentId,
                publicNotes,
                privateNotes,
            },
        });
        revalidatePath('/admin/events');
        return NextResponse.json(setMusician, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
