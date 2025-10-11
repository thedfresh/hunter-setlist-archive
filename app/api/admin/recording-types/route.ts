import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
    try {
        const { name, description } = await req.json();
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        const recordingType = await prisma.recordingType.create({
            data: { name: name.trim(), description: description?.trim() || null },
        });
        revalidatePath('/admin/recording-types');
        return NextResponse.json(recordingType, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to create recording type' }, { status: 500 });
    }
}
