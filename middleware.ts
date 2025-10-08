import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only run for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const ALLOWED_IPS = ['209.6.207.13'];
    
    // Get real IP (considering proxies)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIP = forwardedFor ? forwardedFor.split(',')[0].trim() : 
                   request.headers.get('x-real-ip') || 
                   'unknown';
    
    if (!ALLOWED_IPS.includes(realIP)) {
      return new NextResponse('Access Denied', { status: 403 });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};