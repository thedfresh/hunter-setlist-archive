import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { bandId, musicianId, joinedDate, leftDate, publicNotes, privateNotes } = body;
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
        try {
            const bandMusician = await prisma.bandMusician.create({ data });
            revalidatePath("/admin/bands");
            return NextResponse.json(bandMusician, { status: 201 });
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
