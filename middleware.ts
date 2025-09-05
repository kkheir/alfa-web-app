import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

export async function middleware(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/admin') || pathname.startsWith('/alfa-manager')) {
      if (!token || !(await verifyToken(token))) {
          return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // Respond with an error page, but avoid the middleware crashing
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export const config = {
  matcher: ['/admin/:path*', '/alfa-manager/:path*'],
}
