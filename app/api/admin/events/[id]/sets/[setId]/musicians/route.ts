import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateAll } from '@/lib/utils/revalidation';

export async function GET(_req: Request, { params }: { params: { id: string; setId: string } }) {
    try {
        const setId = Number(params.setId);
        const setMusicians = await prisma.setMusician.findMany({
            where: { setId },
            include: {
                musician: { select: { id: true, name: true } },
                instruments: {
                    include: {
                        instrument: { select: { id: true, displayName: true } }
                    }
                }
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
        const { musicianId, instrumentIds, publicNotes, privateNotes } = body;
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
                publicNotes,
                privateNotes,
                instruments: {
                    create: (instrumentIds || []).map((instId: number) => ({
                        instrumentId: instId
                    }))
                }
            },
            include: {
                instruments: {
                    include: {
                        instrument: true
                    }
                }
            }
        });
        revalidateAll();
        return NextResponse.json(setMusician, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}