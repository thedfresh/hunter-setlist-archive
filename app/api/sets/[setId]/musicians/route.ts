import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { setId: string } }) {
  const setId = Number(params.setId);
  try {
    const setMusicians = await prisma.setMusician.findMany({
      where: { setId },
      include: {
        musician: true,
        instrument: true,
      },
      orderBy: { id: "asc" },
    });
    return NextResponse.json({ musicians: setMusicians });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch set musicians." }, { status: 500 });
  }
}
