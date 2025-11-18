import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidateAll } from '@/lib/utils/revalidation';

export async function PUT(req: Request, { params }: { params: { id: string; setId: string } }) {
    try {
        const body = await req.json();
        const { performanceId, targetSetId, targetPosition } = body;
        if (
            typeof performanceId !== "number" ||
            typeof targetSetId !== "number" ||
            typeof targetPosition !== "number"
        ) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }
        const performance = await prisma.performance.findUnique({ where: { id: performanceId } });
        if (!performance) {
            return NextResponse.json({ error: "Performance not found" }, { status: 404 });
        }
        await prisma.$transaction([
            // Remove gap in source set
            prisma.performance.updateMany({
                where: {
                    setId: performance.setId,
                    performanceOrder: { gt: performance.performanceOrder }
                },
                data: { performanceOrder: { decrement: 1 } }
            }),
            // Make room in target set
            prisma.performance.updateMany({
                where: {
                    setId: targetSetId,
                    performanceOrder: { gte: targetPosition }
                },
                data: { performanceOrder: { increment: 1 } }
            }),
            // Move the performance
            prisma.performance.update({
                where: { id: performanceId },
                data: { setId: targetSetId, performanceOrder: targetPosition }
            })
        ]);
        revalidateAll();
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || "Failed to move performance" }, { status: 500 });
    }
}
