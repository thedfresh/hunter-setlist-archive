import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for BOTH /admin and /api/admin routes
  if (request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/api/admin')) {

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return new NextResponse('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic' },
      });
    }
    if (!authHeader.startsWith('Basic ')) {
      return new NextResponse('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic' },
      });
    }
    const authValue = authHeader.split(' ')[1];
    let user = '', pwd = '';
    try {
      [user, pwd] = Buffer.from(authValue, 'base64').toString().split(':');
    } catch {
      return new NextResponse('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic' },
      });
    }
    if (
      user === process.env.ADMIN_USER &&
      pwd === process.env.ADMIN_PASSWORD
    ) {
      // Auth successful - create response with no-cache headers
      const response = NextResponse.next();
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      return response;
    }
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic' },
    });

  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};