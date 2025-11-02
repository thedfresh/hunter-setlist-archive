import { NextResponse } from "next/server";
import { addDisplayNames } from '@/lib/utils/musicianFormatter';
import { compareMusicianNames } from '@/lib/utils/musicianSort';
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Use the full browse query for musicians
        const { getMusiciansBrowse } = await import('@/lib/queries/musicianBrowseQueries');
        const musicians = await getMusiciansBrowse();
        return NextResponse.json({ musicians });
    } catch (error) {
        const message = typeof error === 'object' && error && 'message' in error ? (error as any).message : 'Failed to fetch musicians';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
