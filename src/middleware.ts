import { createClientForServer } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Skip middleware for certain paths
  const skipPaths = ['/auth', '/callback', '/api', '/_next', '/favicon.ico'];
  if (skipPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  try {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If no user, continue (auth pages will handle this)
    if (!user) {
      return NextResponse.next();
    }

    // User is authenticated, allow request to proceed
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
