import { prisma } from "@/lib/prisma";
import { revalidateAll } from '@/lib/utils/revalidation';
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const musicianId = Number(params.id);
    if (!musicianId) {
        return NextResponse.json({ error: "Missing or invalid musicianId" }, { status: 400 });
    }
    try {
        const body = await req.json();
        const { instrumentIds } = body;
        if (!Array.isArray(instrumentIds)) {
            return NextResponse.json({ error: "instrumentIds must be an array" }, { status: 400 });
        }
        // Delete existing default instruments
        await prisma.musicianDefaultInstrument.deleteMany({ where: { musicianId } });
        // Create new default instruments
        for (const instrumentId of instrumentIds) {
            await prisma.musicianDefaultInstrument.create({
                data: { musicianId, instrumentId },
            });
        }
        // Fetch updated musician with instruments
        const musician = await prisma.musician.findUnique({
            where: { id: musicianId },
            include: {
                defaultInstruments: {
                    include: { instrument: true }
                }
            }
        });
        revalidateAll();
        return NextResponse.json({ musician });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || "Failed to update default instruments" }, { status: 500 });
    }
}
