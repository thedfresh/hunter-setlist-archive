import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidateAll } from '@/lib/utils/revalidation';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const eventId = Number(params.id);
        const body = await req.json();
        const { setIds } = body;
        if (!Array.isArray(setIds) || setIds.some(id => typeof id !== "number")) {
            return NextResponse.json({ error: "Invalid setIds array" }, { status: 400 });
        }
        const updatePromises = setIds.map((setId, index) =>
            prisma.set.update({
                where: { id: setId },
                data: { position: index + 1 }
            })
        );
        await prisma.$transaction(updatePromises);
        revalidateAll();
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || "Failed to reorder sets" }, { status: 500 });
    }
}
