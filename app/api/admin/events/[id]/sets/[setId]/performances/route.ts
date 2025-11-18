import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidateAll } from '@/lib/utils/revalidation';

export async function GET(_req: Request, { params }: { params: { id: string; setId: string } }) {
    try {
        const setId = Number(params.setId);
        const performances = await prisma.performance.findMany({
            where: { setId },
            orderBy: { performanceOrder: "asc" },
            include: {
                song: {
                    select: {
                        id: true,
                        title: true,
                        songTags: {
                            include: {
                                tag: { select: { id: true, name: true } }
                            }
                        }
                    }
                },
                performanceMusicians: {
                    include: {
                        musician: { select: { id: true, name: true } },
                        instrument: { select: { id: true, displayName: true } }
                    }
                },
                leadVocals: {
                    select: { id: true, name: true }
                }
            }
        });
        return NextResponse.json({ performances });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || "Failed to fetch performances" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { id: string; setId: string } }) {
    try {
        const setId = Number(params.setId);
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

        let perfOrder = performanceOrder;
        if (typeof perfOrder !== "number") {
            const lastPerf = await prisma.performance.findFirst({
                where: { setId },
                orderBy: { performanceOrder: "desc" }
            });
            perfOrder = lastPerf ? lastPerf.performanceOrder + 1 : 1;
        }

        const createdPerformance = await prisma.performance.create({
            data: {
                setId,
                songId,
                performanceOrder: perfOrder,
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
        if (Array.isArray(body.vocalistData) && body.vocalistData.length > 0) {
            for (const v of body.vocalistData) {
                await prisma.performanceVocalist.create({
                    data: {
                        performanceId: createdPerformance.id,
                        musicianId: v.musicianId,
                        vocalRole: v.vocalRole
                    }
                });
            }
        }

        revalidateAll();
        return NextResponse.json(createdPerformance, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || "Failed to create performance" }, { status: 500 });
    }
}
