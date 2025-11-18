import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { bandId, musicianId, joinedDate, leftDate, publicNotes, privateNotes, instrumentIds } = body;
        if (!bandId || !musicianId) {
            return NextResponse.json({ error: "bandId and musicianId are required" }, { status: 400 });
        }
        const data: any = {
            bandId,
            musicianId,
            joinedDate: joinedDate ? new Date(joinedDate) : null,
            leftDate: leftDate ? new Date(leftDate) : null,
            publicNotes: publicNotes ?? null,
            privateNotes: privateNotes ?? null,
        };
        let bandMusician;
        try {
            bandMusician = await prisma.bandMusician.create({ data });
            // Handle instrumentIds array
            if (Array.isArray(instrumentIds) && instrumentIds.length > 0) {
                try {
                    for (const instrumentId of instrumentIds) {
                        await prisma.bandMusicianInstrument.create({
                            data: {
                                bandMusicianId: bandMusician.id,
                                instrumentId,
                            },
                        });
                    }
                } catch (instErr: any) {
                    // Cleanup: delete bandMusician if instrument creation fails
                    await prisma.bandMusician.delete({ where: { id: bandMusician.id } });
                    return NextResponse.json({ error: instErr?.message || "Failed to add instruments" }, { status: 500 });
                }
            }
            // Fetch with instruments included
            const bandMusicianWithInstruments = await prisma.bandMusician.findUnique({
                where: { id: bandMusician.id },
                include: {
                    musician: true,
                    band: true,
                    instruments: { include: { instrument: true } },
                },
            });
            revalidatePath("/admin/bands");
            return NextResponse.json(bandMusicianWithInstruments, { status: 201 });
        } catch (err: any) {
            if (err.code === "P2002") {
                return NextResponse.json({ error: "This musician is already in this band" }, { status: 400 });
            }
            throw err;
        }
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || "Failed to add band member" }, { status: 500 });
    }
}
