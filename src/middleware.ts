export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

function isAdminRoute(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;
  const method = request.method.toUpperCase();

  if (pathname.startsWith('/api/features')) {
    return method !== 'GET';
  }
  if (pathname.startsWith('/api/contact')) {
    return method !== 'POST';
  }
  if (pathname.startsWith('/api/auth/me')) {
    return true;
  }
  return false;
}

function unauthorizedResponse(request: NextRequest): NextResponse {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.redirect(new URL('/', request.url));
}

export function middleware(request: NextRequest) {
  if (!isAdminRoute(request)) {
    return NextResponse.next();
  }

  const token = getTokenFromHeader(request.headers.get('authorization')) || request.cookies.get('token')?.value || null;
  if (!token) {
    return unauthorizedResponse(request);
  }

  try {
    const payload = verifyToken(token);
    if (payload.role !== 'admin') {
      return unauthorizedResponse(request);
    }
    return NextResponse.next();
  } catch {
    return unauthorizedResponse(request);
  }
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*']
};
