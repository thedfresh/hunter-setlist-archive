import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    try {
        const eventId = Number(params.id);
        const sets = await prisma.set.findMany({
            where: { eventId },
            orderBy: { position: "asc" },
            include: {
                setType: {
                    select: { id: true, name: true, displayName: true }
                },
                band: {
                    select: { id: true, name: true }
                },
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
        return NextResponse.json({ sets });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || "Failed to fetch sets" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const eventId = Number(params.id);
        const body = await req.json();
        const {
            setTypeId,
            position,
            bandId = null,
            publicNotes = "",
            privateNotes = "",
            isUncertain = false
        } = body;

        let setPosition = position;
        if (typeof setPosition !== "number") {
            const lastSet = await prisma.set.findFirst({
                where: { eventId },
                orderBy: { position: "desc" }
            });
            setPosition = lastSet ? lastSet.position + 1 : 1;
        }

        const createdSet = await prisma.set.create({
            data: {
                eventId,
                setTypeId,
                position: setPosition,
                bandId,
                publicNotes,
                privateNotes,
                isUncertain
            }
        });
        revalidatePath('/admin/events');
        return NextResponse.json(createdSet, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || "Failed to create set" }, { status: 500 });
    }
}
