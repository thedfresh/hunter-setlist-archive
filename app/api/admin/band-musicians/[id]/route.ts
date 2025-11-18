import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    try {
        const bandMusician = await prisma.bandMusician.findUnique({
            where: { id },
            include: {
                musician: true,
                band: true,
                instruments: { include: { instrument: true } },
            },
        });
        if (!bandMusician) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        return NextResponse.json(bandMusician);
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || "Failed to fetch band member" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    try {
        const body = await req.json();
        const { joinedDate, leftDate, publicNotes, privateNotes, instrumentIds } = body;
        const data: any = {
            joinedDate: joinedDate ? new Date(joinedDate) : null,
            leftDate: leftDate ? new Date(leftDate) : null,
            publicNotes: publicNotes ?? null,
            privateNotes: privateNotes ?? null,
        };
        const bandMusician = await prisma.bandMusician.update({
            where: { id },
            data,
        });
        // Update instruments if provided
        if (Array.isArray(instrumentIds)) {
            await prisma.bandMusicianInstrument.deleteMany({ where: { bandMusicianId: id } });
            for (const instrumentId of instrumentIds) {
                await prisma.bandMusicianInstrument.create({
                    data: { bandMusicianId: id, instrumentId },
                });
            }
        }
        // Fetch updated record with instruments included
        const bandMusicianWithInstruments = await prisma.bandMusician.findUnique({
            where: { id },
            include: {
                musician: true,
                band: true,
                instruments: { include: { instrument: true } },
            },
        });
        revalidatePath("/admin/bands");
        return NextResponse.json(bandMusicianWithInstruments);
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || "Failed to update band member" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    try {
        await prisma.bandMusician.delete({ where: { id } });
        revalidatePath("/admin/bands");
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || "Failed to delete band member" }, { status: 500 });
    }
}
