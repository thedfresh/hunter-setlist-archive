import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const contributors = await prisma.contributor.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ contributors });
  } catch (error) {
    console.error('GET /api/contributors error:', error);
    return NextResponse.json({ error: 'Failed to fetch contributors.', details: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.name || typeof data.name !== 'string') {
      return NextResponse.json({ error: 'Contributor name is required.' }, { status: 400 });
    }
    const contributor = await prisma.contributor.create({
      data: { name: data.name },
    });
    return NextResponse.json({ contributor }, { status: 201 });
  } catch (error) {
    console.error('POST /api/contributors error:', error);
    return NextResponse.json({ error: 'Failed to create contributor.', details: String(error) }, { status: 500 });
  }
}
