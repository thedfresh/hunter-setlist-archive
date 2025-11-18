import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function PUT(req: Request, { params }: { params: { setId: string; performanceId: string } }) {
  const awaitedParams = await params;
  const setId = Number(awaitedParams.setId);
  const performanceId = Number(awaitedParams.performanceId);
  const data = await req.json();
  // Shift existing orders to make room, then update performance
  const newOrder = Number(data.performanceOrder);
  // Fetch current performance and its old order
  const currentPerf = await prisma.performance.findUnique({ where: { id: performanceId } });
  if (!currentPerf) return NextResponse.json({ error: "Performance not found." }, { status: 404 });
  const oldOrder = currentPerf.performanceOrder;
  // Delete guest musicians before updating
  await prisma.performanceMusician.deleteMany({ where: { performanceId } });
  // Build base update payload
  const updateData: any = {
    song: { connect: { id: data.songId } },
    performanceOrder: data.performanceOrder,
    seguesInto: !!data.seguesInto,
    isTruncatedStart: !!data.isTruncatedStart,
    isTruncatedEnd: !!data.isTruncatedEnd,
    hasCuts: !!data.hasCuts,
    isPartial: !!data.isPartial,
    publicNotes: data.publicNotes || null,
    privateNotes: data.privateNotes || null,
    isUncertain: typeof data.isUncertain === "boolean" ? data.isUncertain : false,
    isSoloHunter: !!data.isSoloHunter,
    isLyricalFragment: !!data.isLyricalFragment,
    isMusicalFragment: !!data.isMusicalFragment,
    isMedley: !!data.isMedley,
    performanceMusicians: {
      create: (data.guestMusicians || []).map((gm: any) => ({
        musicianId: Number(gm.musicianId),
        instrumentId: gm.instrumentId ? Number(gm.instrumentId) : null,
      })),
    },
  };
  if (
    data.leadVocalsId !== undefined &&
    data.leadVocalsId !== "" &&
    !isNaN(Number(data.leadVocalsId)) &&
    Number(data.leadVocalsId) > 0
  ) {
    updateData.leadVocals = { connect: { id: Number(data.leadVocalsId) } };
  } else {
    updateData.leadVocals = { disconnect: true };
  }
  // Perform shift and update in transaction to avoid duplicates
  const [_, perf] = await prisma.$transaction([
    // shift others
    newOrder < oldOrder
      ? prisma.performance.updateMany({
        where: { setId, performanceOrder: { gte: newOrder, lt: oldOrder } },
        data: { performanceOrder: { increment: 1 } },
      })
      : prisma.performance.updateMany({
        where: { setId, performanceOrder: { lte: newOrder, gt: oldOrder } },
        data: { performanceOrder: { decrement: 1 } },
      }),
    // update this performance
    prisma.performance.update({
      where: { id: performanceId },
      data: { ...updateData, performanceOrder: newOrder },
      include: { song: true, performanceMusicians: { include: { musician: true, instrument: true } } },
    }),
  ]);
  revalidatePath('/api/events');
  revalidatePath('/event');
  return NextResponse.json({ performance: perf });
}

export async function DELETE(req: Request, { params }: { params: { setId: string; performanceId: string } }) {
  const performanceId = Number(params.performanceId);
  await prisma.performanceMusician.deleteMany({ where: { performanceId } });
  await prisma.performance.delete({ where: { id: performanceId } });
  revalidatePath('/api/events');
  revalidatePath('/event');
  return NextResponse.json({ success: true });
}
