import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const name = (body.name || '').trim();
        const displayName = (body.displayName || '').trim();
        const includeInStats = body.includeInStats !== undefined ? !!body.includeInStats : true;
        if (!name || !displayName) {
            return NextResponse.json({ error: 'Name and Display Name are required.' }, { status: 400 });
        }
        const setType = await prisma.setType.create({
            data: { name, displayName, includeInStats }
        });
        revalidatePath('/admin/set-types');
        return NextResponse.json(setType, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create set type.' }, { status: 500 });
    }
}
