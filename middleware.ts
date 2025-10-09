import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for BOTH /admin and /api/admin routes
  if (request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/api/admin')) {

    const ALLOWED_IPS = ['209.6.207.13', '127.0.0.1', '::1'];

    // Get real IP (considering proxies)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIP = forwardedFor ? forwardedFor.split(',')[0].trim() :
      request.headers.get('x-real-ip') ||
      'unknown';

    //console.log('Checking IP:', realIP); // Debug log

    if (!ALLOWED_IPS.includes(realIP)) {
      return new NextResponse('Access Denied', { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};