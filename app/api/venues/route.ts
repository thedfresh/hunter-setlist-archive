import { NextResponse } from 'next/server';
import { getVenuesBrowse } from '@/lib/queries/venueBrowseQueries';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includePrivate = searchParams.get('includePrivate') === 'true';
    const venues = await getVenuesBrowse({ includePrivate });
    return NextResponse.json({ venues });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch venues.' }, { status: 500 });
  }
}
