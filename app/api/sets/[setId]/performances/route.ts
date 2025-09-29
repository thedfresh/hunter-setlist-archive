import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: Promise<{ setId: string }> }) {
  const { setId: setIdParam } = await params;
  const setId = Number(setIdParam);
  const performances = await prisma.performance.findMany({
    where: { setId },
    include: {
      song: true,
      performanceMusicians: {
        include: { musician: true, instrument: true },
      },
      leadVocals: true,
    },
    orderBy: { performanceOrder: "asc" },
  });
  return NextResponse.json({ performances });
}

export async function POST(req: Request, { params }: { params: { setId: string } }) {
  const setId = Number(params.setId);
  const data = await req.json();
  // Check for duplicate order
  const exists = await prisma.performance.findFirst({
    where: { setId, performanceOrder: data.performanceOrder },
  });
  if (exists) {
    return NextResponse.json({ error: "Duplicate performance order in this set." }, { status: 400 });
  }
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
  if (data.leadVocalsId !== undefined && data.leadVocalsId !== "") {
    perfData.leadVocals = { connect: { id: Number(data.leadVocalsId) } };
  }
  const perf = await prisma.performance.create({
    data: perfData,
    include: {
      song: true,
      performanceMusicians: { include: { musician: true, instrument: true } },
    },
  });
  return NextResponse.json({ performance: perf }, { status: 201 });
}
