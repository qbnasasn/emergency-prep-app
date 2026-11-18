import { NextResponse, NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session';

function addCorsHeaders(res: NextResponse | Response) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApiRoute = pathname.startsWith('/api/');
  const isAuthApiRoute = pathname.startsWith('/api/auth/');
  const isProtectedRoute = pathname.startsWith('/dashboard');

  if (isApiRoute && req.method === 'OPTIONS') {
    return addCorsHeaders(new Response(null, { status: 200 }));
  }

  if (isAuthApiRoute) {
    return addCorsHeaders(NextResponse.next());
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (isProtectedRoute && !session) {
    const signInUrl = new URL('/signin', req.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (isApiRoute && !session) {
    return addCorsHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
  }

  return addCorsHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
