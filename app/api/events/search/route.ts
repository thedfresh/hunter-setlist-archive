import { NextRequest, NextResponse } from 'next/server';
import { searchEvents } from '@/lib/queries/eventSearchQueries';

export async function GET(request: NextRequest) {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);

    try {
        const results = await searchEvents(searchParams);
        return NextResponse.json(results);
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json(
            { error: 'Failed to search events' },
            { status: 500 }
        );
    }
}