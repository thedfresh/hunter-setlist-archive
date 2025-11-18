import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidateAll } from '@/lib/utils/revalidation';

export async function GET(_req: Request, { params }: { params: { id: string; setId: string } }) {
    try {
        const setId = Number(params.setId);
        const set = await prisma.set.findUnique({
            where: { id: setId },
            include: {
                setType: true,
                band: true,
                performances: {
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
                }
            }
        });
        if (!set) {
            return NextResponse.json({ error: "Set not found" }, { status: 404 });
        }
        return NextResponse.json(set);
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || "Failed to fetch set" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string; setId: string } }) {
    try {
        const setId = Number(params.setId);
        const body = await req.json();
        const {
            setTypeId,
            position,
            bandId = null,
            publicNotes = "",
            privateNotes = "",
            isUncertain = false
        } = body;
        const updatedSet = await prisma.set.update({
            where: { id: setId },
            data: {
                setTypeId,
                position,
                bandId,
                publicNotes,
                privateNotes,
                isUncertain
            }
        });
        revalidateAll();
        return NextResponse.json(updatedSet);
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || "Failed to update set" }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string; setId: string } }) {
    try {
        const setId = Number(params.setId);
        await prisma.set.delete({ where: { id: setId } });
        revalidateAll();
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || "Failed to delete set" }, { status: 500 });
    }
}
