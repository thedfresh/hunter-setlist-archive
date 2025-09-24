import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  const setTypes = await prisma.setType.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json({ setTypes });
}
