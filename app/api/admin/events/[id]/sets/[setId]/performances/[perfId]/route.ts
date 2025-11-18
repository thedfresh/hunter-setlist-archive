import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function PUT(req: Request, { params }: { params: { id: string; setId: string; perfId: string } }) {
    try {
        const perfId = Number(params.perfId);
        const body = await req.json();
        const {
            songId,
            performanceOrder,
            seguesInto = false,
            isTruncatedStart = false,
            isTruncatedEnd = false,
            hasCuts = false,
            isPartial = false,
            isMedley = false,
            isLyricalFragment = false,
            isMusicalFragment = false,
            isSoloHunter = false,
            isUncertain = false,
            leadVocalsId = null,
            publicNotes = "",
            privateNotes = ""
        } = body;
        const updatedPerformance = await prisma.performance.update({
            where: { id: perfId },
            data: {
                songId,
                performanceOrder,
                seguesInto,
                isTruncatedStart,
                isTruncatedEnd,
                hasCuts,
                isPartial,
                isMedley,
                isLyricalFragment,
                isMusicalFragment,
                isSoloHunter,
                isUncertain,
                isInstrumental: body.isInstrumental ?? false,
                leadVocalsId,
                publicNotes,
                privateNotes
            }
        });

        // Handle vocalistData if provided
        if ('vocalistData' in body) {
            await prisma.performanceVocalist.deleteMany({ where: { performanceId: perfId } });
            if (Array.isArray(body.vocalistData) && body.vocalistData.length > 0) {
                for (const v of body.vocalistData) {
                    await prisma.performanceVocalist.create({
                        data: {
                            performanceId: perfId,
                            musicianId: v.musicianId,
                            vocalRole: v.vocalRole
                        }
                    });
                }
            }
        }

        revalidatePath('/admin/events');
        return NextResponse.json(updatedPerformance);
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || "Failed to update performance" }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string; setId: string; perfId: string } }) {
    try {
        const perfId = Number(params.perfId);
        const setId = Number(params.setId);
        const deleted = await prisma.performance.findUnique({ where: { id: perfId } });
        if (!deleted) {
            return NextResponse.json({ error: "Performance not found" }, { status: 404 });
        }
        await prisma.performance.delete({ where: { id: perfId } });
        await prisma.performance.updateMany({
            where: { setId, performanceOrder: { gt: deleted.performanceOrder } },
            data: { performanceOrder: { decrement: 1 } }
        });
        revalidatePath('/admin/events');
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || "Failed to delete performance" }, { status: 500 });
    }
}
