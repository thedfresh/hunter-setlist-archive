import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ tags });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tags.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.name || typeof data.name !== 'string') {
      return NextResponse.json({ error: 'Tag name is required.' }, { status: 400 });
    }
    try {
      const tag = await prisma.tag.create({
        data: {
          name: data.name.trim(),
          description: data.description || null,
        },
      });
      return NextResponse.json({ tag }, { status: 201 });
    } catch (err: any) {
      if (err.code === 'P2002') {
        return NextResponse.json({ error: 'Tag name must be unique.' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Failed to create tag.' }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: 'Failed to create tag.' }, { status: 500 });
  }
}
