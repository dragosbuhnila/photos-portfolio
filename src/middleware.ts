import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from '@/lib/auth-token';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = sessionToken ? await verifySessionToken(sessionToken) : false;

  if (!isAuthenticated) {
    // For protected API endpoints, return 401 Unauthorized
    if (pathname.startsWith('/api/admin')) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    // For manage page routes, redirect to the login screen
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/manage/:path*', '/api/admin/:path*'],
};
