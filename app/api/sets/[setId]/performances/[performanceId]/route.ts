import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: { setId: string; performanceId: string } }) {
  const awaitedParams = await params;
  const setId = Number(awaitedParams.setId);
  const performanceId = Number(awaitedParams.performanceId);
  const data = await req.json();
  // Check for duplicate order
  const exists = await prisma.performance.findFirst({
    where: { setId, performanceOrder: data.performanceOrder, NOT: { id: performanceId } },
  });
  if (exists) {
    return NextResponse.json({ error: "Duplicate performance order in this set." }, { status: 400 });
  }
  // Update performance and guest musicians
  await prisma.performanceMusician.deleteMany({ where: { performanceId } });
  // Fetch current performance to check leadVocals
  const currentPerf = await prisma.performance.findUnique({
    where: { id: performanceId },
    include: { leadVocals: true },
  });
  // Build update data object, only include leadVocalsId if present
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
  const perf = await prisma.performance.update({
    where: { id: performanceId },
    data: updateData,
    include: {
      song: true,
      performanceMusicians: { include: { musician: true, instrument: true } },
    },
  });
  return NextResponse.json({ performance: perf });
}

export async function DELETE(req: Request, { params }: { params: { setId: string; performanceId: string } }) {
  const performanceId = Number(params.performanceId);
  await prisma.performanceMusician.deleteMany({ where: { performanceId } });
  await prisma.performance.delete({ where: { id: performanceId } });
  return NextResponse.json({ success: true });
}
