import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidateAll } from '@/lib/utils/revalidation';

const ALLOWED_FIELDS = [
    'seguesInto',
    'isPartial',
    'isMedley',
    'isLyricalFragment',
    'isMusicalFragment'
];

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const body = await req.json();
        const field = Object.keys(body)[0];
        const value = body[field];

        // Security: only allow specific boolean fields
        if (!ALLOWED_FIELDS.includes(field)) {
            return NextResponse.json({ error: 'Invalid field' }, { status: 400 });
        }

        if (typeof value !== 'boolean') {
            return NextResponse.json({ error: 'Value must be boolean' }, { status: 400 });
        }

        const updated = await prisma.performance.update({
            where: { id },
            data: { [field]: value }
        });

        revalidateAll();
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Quick update error:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}