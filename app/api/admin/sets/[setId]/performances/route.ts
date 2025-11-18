import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { revalidateAll } from '@/lib/utils/revalidation';


export async function POST(req: Request, { params }: { params: Promise<{ setId: string }> }) {
  const { setId: setIdParam } = await params;
  const setId = Number(setIdParam);
  const data = await req.json();
  // Shift existing performances at or after the desired order down by 1, then create new
  const newOrder = Number(data.performanceOrder);
  const perfData: any = {
    setId,
    songId: data.songId,
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
  // Only include leadVocalsId when provided, valid (>0), and exists in database
  if (typeof data.leadVocalsId === 'number' && data.leadVocalsId > 0) {
    const musician = await prisma.musician.findUnique({ where: { id: data.leadVocalsId } });
    if (!musician) {
      return NextResponse.json({ error: `Lead vocals musician not found (id: ${data.leadVocalsId}).` }, { status: 400 });
    }
    perfData.leadVocalsId = data.leadVocalsId;
  }
  // Transaction: shift and insert
  const [, perf] = await prisma.$transaction([
    prisma.performance.updateMany({
      where: { setId, performanceOrder: { gte: newOrder } },
      data: { performanceOrder: { increment: 1 } },
    }),
    prisma.performance.create({
      data: perfData,
      include: {
        song: true,
        performanceMusicians: { include: { musician: true, instrument: true } },
      },
    }),
  ]);
  revalidateAll();
  return NextResponse.json({ performance: perf }, { status: 201 });
}
