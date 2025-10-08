import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const eventId = Number(id);
  const sets = await prisma.set.findMany({
    where: { eventId },
    include: { setType: true },
    orderBy: { position: "asc" },
  });
  return NextResponse.json({ sets });
}
