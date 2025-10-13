import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function PUT(req: Request, { params }: { params: { id: string; setId: string } }) {
    try {
        const setId = Number(params.setId);
        const body = await req.json();
        const { performanceIds } = body;
        if (!Array.isArray(performanceIds) || performanceIds.some(id => typeof id !== "number")) {
            return NextResponse.json({ error: "Invalid performanceIds array" }, { status: 400 });
        }
        const updatePromises = performanceIds.map((perfId, index) =>
            prisma.performance.update({
                where: { id: perfId },
                data: { performanceOrder: index + 1 }
            })
        );
        await prisma.$transaction(updatePromises);
        revalidatePath('/admin/events');
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || "Failed to reorder performances" }, { status: 500 });
    }
}
